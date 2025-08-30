"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus, FileText } from "lucide-react"
import { useAuth } from "../../contexts/auth-context"

interface LeaveRequest {
    id: string
    employeeId: string
    employeeName: string
    startDate: string
    endDate: string
    type: "Annual" | "Sick" | "Personal" | "Other"
    reason: string
    status: "Pending" | "Approved" | "Rejected"
    createdAt: string
    approvedBy?: string
    rejectionReason?: string
}

export default function LeaveManagement() {
    const { user } = useAuth()
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        type: "Annual" as const,
        reason: "",
    })
    const [rejectionReason, setRejectionReason] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        // Load leave requests from localStorage
        const storedRequests = localStorage.getItem("leaveRequests")
        if (storedRequests) {
            setLeaveRequests(JSON.parse(storedRequests))
        } else {
            // Initialize with sample data if none exists
            const sampleRequests: LeaveRequest[] = [
                {
                    id: "1",
                    employeeId: "2",
                    employeeName: "Employee User",
                    startDate: "2023-05-10",
                    endDate: "2023-05-12",
                    type: "Annual",
                    reason: "Family vacation",
                    status: "Approved",
                    createdAt: "2023-05-01T10:30:00Z",
                    approvedBy: "Admin User",
                },
                {
                    id: "2",
                    employeeId: "2",
                    employeeName: "Employee User",
                    startDate: "2023-06-15",
                    endDate: "2023-06-16",
                    type: "Sick",
                    reason: "Doctor's appointment",
                    status: "Pending",
                    createdAt: "2023-06-10T09:15:00Z",
                },
            ]
            setLeaveRequests(sampleRequests)
            localStorage.setItem("leaveRequests", JSON.stringify(sampleRequests))
        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validate form
        if (!formData.startDate || !formData.endDate || !formData.type || !formData.reason) {
            setError("Please fill in all fields")
            return
        }

        // Calculate days difference
        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // Include both start and end days

        if (start > end) {
            setError("End date cannot be before start date")
            return
        }

        if (!user) {
            setError("User information not available")
            return
        }

        // Check if user has enough leave balance
        if (user.leaveBalance && user.leaveBalance < diffDays) {
            setError(`You don't have enough leave balance. Available: ${user.leaveBalance} days, Requested: ${diffDays} days`)
            return
        }

        // Create new leave request
        const newRequest: LeaveRequest = {
            id: Date.now().toString(),
            employeeId: user.id,
            employeeName: user.name,
            startDate: formData.startDate,
            endDate: formData.endDate,
            type: formData.type,
            reason: formData.reason,
            status: "Pending",
            createdAt: new Date().toISOString(),
        }

        const updatedRequests = [...leaveRequests, newRequest]
        setLeaveRequests(updatedRequests)
        localStorage.setItem("leaveRequests", JSON.stringify(updatedRequests))

        // Reset form and close modal
        setFormData({
            startDate: "",
            endDate: "",
            type: "Annual",
            reason: "",
        })
        setIsModalOpen(false)
    }

    const handleApproveReject = (id: string, status: "Approved" | "Rejected") => {
        if (!user || user.role !== "admin") return

        const updatedRequests = leaveRequests.map((request) => {
            if (request.id === id) {
                return {
                    ...request,
                    status,
                    approvedBy: status === "Approved" ? user.name : undefined,
                    rejectionReason: status === "Rejected" ? rejectionReason : undefined,
                }
            }
            return request
        })

        setLeaveRequests(updatedRequests)
        localStorage.setItem("leaveRequests", JSON.stringify(updatedRequests))
        setSelectedRequest(null)
        setIsViewModalOpen(false)
        setRejectionReason("")
    }

    // Filter requests based on user role
    const filteredRequests =
        user?.role === "admin" ? leaveRequests : leaveRequests.filter((request) => request.employeeId === user?.id)

    // Calculate leave statistics
    const pendingRequests = filteredRequests.filter((req) => req.status === "Pending").length
    const approvedRequests = filteredRequests.filter((req) => req.status === "Approved").length
    const rejectedRequests = filteredRequests.filter((req) => req.status === "Rejected").length

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Leave Management</h1>
                    <p className="text-gray-600 mt-1">
                        {user?.role === "admin" ? "Manage employee leave requests" : "Request and track your leave"}
                    </p>
                </div>
                {user?.role !== "admin" && (
                    <div className="mt-4 md:mt-0">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Request Leave
                        </button>
                    </div>
                )}
            </div>

            {/* Leave Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                            <p className="text-2xl font-semibold text-gray-800">{pendingRequests}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Approved Leaves</p>
                            <p className="text-2xl font-semibold text-gray-800">{approvedRequests}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                            <XCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Rejected Requests</p>
                            <p className="text-2xl font-semibold text-gray-800">{rejectedRequests}</p>
                        </div>
                    </div>
                </div>
            </div>

            {user?.role !== "admin" && (
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Available Leave Balance</p>
                            <p className="text-2xl font-semibold text-gray-800">{user?.leaveBalance || 0} days</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Leave Requests Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        {user?.role === "admin" ? "Employee Leave Requests" : "Your Leave Requests"}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    {filteredRequests.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {user?.role === "admin" && (
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Employee
                                        </th>
                                    )}
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Leave Type
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Duration
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Requested On
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRequests.map((request) => {
                                    // Calculate days
                                    const start = new Date(request.startDate)
                                    const end = new Date(request.endDate)
                                    const diffTime = Math.abs(end.getTime() - start.getTime())
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

                                    return (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            {user?.role === "admin" && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{request.employeeName}</div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{request.type}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {request.startDate} to {request.endDate}
                                                    <span className="text-xs text-gray-500 ml-1">({diffDays} days)</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${request.status === "Approved"
                                                            ? "bg-green-100 text-green-800"
                                                            : request.status === "Pending"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request)
                                                        setIsViewModalOpen(true)
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No leave requests found</p>
                            {user?.role !== "admin" && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Request Leave
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Request Leave Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <Calendar className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Request Leave</h3>
                                        <div className="mt-4">
                                            <form onSubmit={handleSubmit}>
                                                {error && (
                                                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                                                        <div className="flex">
                                                            <div className="flex-shrink-0">
                                                                <AlertCircle className="h-5 w-5 text-red-400" />
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm text-red-700">{error}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mb-4">
                                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Leave Type
                                                    </label>
                                                    <select
                                                        id="type"
                                                        name="type"
                                                        value={formData.type}
                                                        onChange={handleChange}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    >
                                                        <option value="Annual">Annual Leave</option>
                                                        <option value="Sick">Sick Leave</option>
                                                        <option value="Personal">Personal Leave</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Start Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            id="startDate"
                                                            name="startDate"
                                                            value={formData.startDate}
                                                            onChange={handleChange}
                                                            min={new Date().toISOString().split("T")[0]}
                                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                                            End Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            id="endDate"
                                                            name="endDate"
                                                            value={formData.endDate}
                                                            onChange={handleChange}
                                                            min={formData.startDate || new Date().toISOString().split("T")[0]}
                                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Reason
                                                    </label>
                                                    <textarea
                                                        id="reason"
                                                        name="reason"
                                                        rows={3}
                                                        value={formData.reason}
                                                        onChange={handleChange}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        placeholder="Please provide a reason for your leave request"
                                                    />
                                                </div>

                                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                    <button
                                                        type="submit"
                                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                                    >
                                                        Submit Request
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                                        onClick={() => setIsModalOpen(false)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Leave Request Modal */}
            {isViewModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <FileText className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Leave Request Details</h3>
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Employee</p>
                                                <p className="text-sm text-gray-900">{selectedRequest.employeeName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Leave Type</p>
                                                <p className="text-sm text-gray-900">{selectedRequest.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Duration</p>
                                                <p className="text-sm text-gray-900">
                                                    {selectedRequest.startDate} to {selectedRequest.endDate}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Reason</p>
                                                <p className="text-sm text-gray-900">{selectedRequest.reason}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Status</p>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${selectedRequest.status === "Approved"
                                                            ? "bg-green-100 text-green-800"
                                                            : selectedRequest.status === "Pending"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {selectedRequest.status}
                                                </span>
                                            </div>
                                            {selectedRequest.status === "Approved" && selectedRequest.approvedBy && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Approved By</p>
                                                    <p className="text-sm text-gray-900">{selectedRequest.approvedBy}</p>
                                                </div>
                                            )}
                                            {selectedRequest.status === "Rejected" && selectedRequest.rejectionReason && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                                                    <p className="text-sm text-gray-900">{selectedRequest.rejectionReason}</p>
                                                </div>
                                            )}

                                            {user?.role === "admin" && selectedRequest.status === "Pending" && (
                                                <div className="mt-4">
                                                    {rejectionReason ? (
                                                        <div>
                                                            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                                                                Rejection Reason
                                                            </label>
                                                            <textarea
                                                                id="rejectionReason"
                                                                rows={3}
                                                                value={rejectionReason}
                                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                                placeholder="Provide a reason for rejection"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex space-x-3">
                                                            <button
                                                                onClick={() => handleApproveReject(selectedRequest.id, "Approved")}
                                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => setRejectionReason(" ")}
                                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                {user?.role === "admin" && selectedRequest.status === "Pending" && rejectionReason ? (
                                    <button
                                        type="button"
                                        onClick={() => handleApproveReject(selectedRequest.id, "Rejected")}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Confirm Rejection
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                    onClick={() => {
                                        setIsViewModalOpen(false)
                                        setSelectedRequest(null)
                                        setRejectionReason("")
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
