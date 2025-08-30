"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MessageSquare, AlertTriangle, CheckCircle, Plus, FileText } from "lucide-react"
import { useAuth } from "../../contexts/auth-context"

interface Complaint {
    id: string
    employeeId: string
    employeeName: string
    title: string
    description: string
    category: "Work Environment" | "Colleague" | "Management" | "Facilities" | "Other"
    status: "Open" | "In Progress" | "Resolved" | "Closed"
    priority: "Low" | "Medium" | "High"
    createdAt: string
    resolvedBy?: string
    resolution?: string
}

export default function Complaints() {
    const { user } = useAuth()
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Work Environment" as const,
        priority: "Medium" as const,
    })
    const [resolution, setResolution] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        // Load complaints from localStorage
        const storedComplaints = localStorage.getItem("complaints")
        if (storedComplaints) {
            setComplaints(JSON.parse(storedComplaints))
        } else {
            // Initialize with sample data if none exists
            const sampleComplaints: Complaint[] = [
                {
                    id: "1",
                    employeeId: "2",
                    employeeName: "Employee User",
                    title: "Broken air conditioning in office",
                    description:
                        "The AC in the main office has been malfunctioning for a week now. It's getting very uncomfortable to work.",
                    category: "Facilities",
                    status: "In Progress",
                    priority: "Medium",
                    createdAt: "2023-04-15T10:30:00Z",
                },
                {
                    id: "2",
                    employeeId: "2",
                    employeeName: "Employee User",
                    title: "Inventory software issues",
                    description: "The inventory software keeps crashing when trying to generate monthly reports.",
                    category: "Work Environment",
                    status: "Open",
                    priority: "High",
                    createdAt: "2023-05-20T14:45:00Z",
                },
            ]
            setComplaints(sampleComplaints)
            localStorage.setItem("complaints", JSON.stringify(sampleComplaints))
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
        if (!formData.title || !formData.description || !formData.category || !formData.priority) {
            setError("Please fill in all fields")
            return
        }

        if (!user) {
            setError("User information not available")
            return
        }

        // Create new complaint
        const newComplaint: Complaint = {
            id: Date.now().toString(),
            employeeId: user.id,
            employeeName: user.name,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            status: "Open",
            priority: formData.priority,
            createdAt: new Date().toISOString(),
        }

        const updatedComplaints = [...complaints, newComplaint]
        setComplaints(updatedComplaints)
        localStorage.setItem("complaints", JSON.stringify(updatedComplaints))

        // Reset form and close modal
        setFormData({
            title: "",
            description: "",
            category: "Work Environment",
            priority: "Medium",
        })
        setIsModalOpen(false)
    }

    const handleUpdateStatus = (id: string, status: "Open" | "In Progress" | "Resolved" | "Closed") => {
        if (!user || user.role !== "admin") return

        const updatedComplaints = complaints.map((complaint) => {
            if (complaint.id === id) {
                return {
                    ...complaint,
                    status,
                    resolvedBy: status === "Resolved" ? user.name : complaint.resolvedBy,
                    resolution: status === "Resolved" ? resolution : complaint.resolution,
                }
            }
            return complaint
        })

        setComplaints(updatedComplaints)
        localStorage.setItem("complaints", JSON.stringify(updatedComplaints))
        setSelectedComplaint(null)
        setIsViewModalOpen(false)
        setResolution("")
    }

    // Filter complaints based on user role
    const filteredComplaints =
        user?.role === "admin" ? complaints : complaints.filter((complaint) => complaint.employeeId === user?.id)

    // Calculate complaint statistics
    const openComplaints = filteredComplaints.filter((c) => c.status === "Open").length
    const inProgressComplaints = filteredComplaints.filter((c) => c.status === "In Progress").length
    const resolvedComplaints = filteredComplaints.filter((c) => c.status === "Resolved" || c.status === "Closed").length

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Complaints Management</h1>
                    <p className="text-gray-600 mt-1">
                        {user?.role === "admin" ? "Manage employee complaints" : "Submit and track your complaints"}
                    </p>
                </div>
                {user?.role !== "admin" && (
                    <div className="mt-4 md:mt-0">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Submit Complaint
                        </button>
                    </div>
                )}
            </div>

            {/* Complaints Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Open Complaints</p>
                            <p className="text-2xl font-semibold text-gray-800">{openComplaints}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">In Progress</p>
                            <p className="text-2xl font-semibold text-gray-800">{inProgressComplaints}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Resolved</p>
                            <p className="text-2xl font-semibold text-gray-800">{resolvedComplaints}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        {user?.role === "admin" ? "Employee Complaints" : "Your Complaints"}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    {filteredComplaints.length > 0 ? (
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
                                        Title
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Category
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Priority
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
                                        Submitted On
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
                                {filteredComplaints.map((complaint) => (
                                    <tr key={complaint.id} className="hover:bg-gray-50">
                                        {user?.role === "admin" && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{complaint.employeeName}</div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{complaint.category}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${complaint.priority === "High"
                                                        ? "bg-red-100 text-red-800"
                                                        : complaint.priority === "Medium"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-green-100 text-green-800"
                                                    }`}
                                            >
                                                {complaint.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${complaint.status === "Open"
                                                        ? "bg-red-100 text-red-800"
                                                        : complaint.status === "In Progress"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-green-100 text-green-800"
                                                    }`}
                                            >
                                                {complaint.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                                onClick={() => {
                                                    setSelectedComplaint(complaint)
                                                    setIsViewModalOpen(true)
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No complaints found</p>
                            {user?.role !== "admin" && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Submit Complaint
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Complaint Modal */}
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
                                        <MessageSquare className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Submit Complaint</h3>
                                        <div className="mt-4">
                                            <form onSubmit={handleSubmit}>
                                                {error && (
                                                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                                                        <div className="flex">
                                                            <div className="flex-shrink-0">
                                                                <AlertTriangle className="h-5 w-5 text-red-400" />
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm text-red-700">{error}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mb-4">
                                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="title"
                                                        name="title"
                                                        value={formData.title}
                                                        onChange={handleChange}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        placeholder="Brief title of your complaint"
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Category
                                                    </label>
                                                    <select
                                                        id="category"
                                                        name="category"
                                                        value={formData.category}
                                                        onChange={handleChange}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    >
                                                        <option value="Work Environment">Work Environment</option>
                                                        <option value="Colleague">Colleague</option>
                                                        <option value="Management">Management</option>
                                                        <option value="Facilities">Facilities</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Priority
                                                    </label>
                                                    <select
                                                        id="priority"
                                                        name="priority"
                                                        value={formData.priority}
                                                        onChange={handleChange}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    >
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                    </select>
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        id="description"
                                                        name="description"
                                                        rows={4}
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        placeholder="Please provide detailed information about your complaint"
                                                    />
                                                </div>

                                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                    <button
                                                        type="submit"
                                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                                    >
                                                        Submit
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

            {/* View Complaint Modal */}
            {isViewModalOpen && selectedComplaint && (
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
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Complaint Details</h3>
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Employee</p>
                                                <p className="text-sm text-gray-900">{selectedComplaint.employeeName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Title</p>
                                                <p className="text-sm text-gray-900">{selectedComplaint.title}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Category</p>
                                                <p className="text-sm text-gray-900">{selectedComplaint.category}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Priority</p>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${selectedComplaint.priority === "High"
                                                            ? "bg-red-100 text-red-800"
                                                            : selectedComplaint.priority === "Medium"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-green-100 text-green-800"
                                                        }`}
                                                >
                                                    {selectedComplaint.priority}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Description</p>
                                                <p className="text-sm text-gray-900">{selectedComplaint.description}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Status</p>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${selectedComplaint.status === "Open"
                                                            ? "bg-red-100 text-red-800"
                                                            : selectedComplaint.status === "In Progress"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-green-100 text-green-800"
                                                        }`}
                                                >
                                                    {selectedComplaint.status}
                                                </span>
                                            </div>
                                            {selectedComplaint.status === "Resolved" && selectedComplaint.resolvedBy && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Resolved By</p>
                                                    <p className="text-sm text-gray-900">{selectedComplaint.resolvedBy}</p>
                                                </div>
                                            )}
                                            {selectedComplaint.status === "Resolved" && selectedComplaint.resolution && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Resolution</p>
                                                    <p className="text-sm text-gray-900">{selectedComplaint.resolution}</p>
                                                </div>
                                            )}

                                            {user?.role === "admin" &&
                                                (selectedComplaint.status === "Open" || selectedComplaint.status === "In Progress") && (
                                                    <div className="mt-4">
                                                        {selectedComplaint.status === "In Progress" && (
                                                            <div>
                                                                <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Resolution
                                                                </label>
                                                                <textarea
                                                                    id="resolution"
                                                                    rows={3}
                                                                    value={resolution}
                                                                    onChange={(e) => setResolution(e.target.value)}
                                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                                    placeholder="Describe how this complaint was resolved"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                {user?.role === "admin" && (
                                    <>
                                        {selectedComplaint.status === "Open" && (
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateStatus(selectedComplaint.id, "In Progress")}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                                            >
                                                Mark In Progress
                                            </button>
                                        )}
                                        {selectedComplaint.status === "In Progress" && resolution && (
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateStatus(selectedComplaint.id, "Resolved")}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                            >
                                                Mark Resolved
                                            </button>
                                        )}
                                    </>
                                )}
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                    onClick={() => {
                                        setIsViewModalOpen(false)
                                        setSelectedComplaint(null)
                                        setResolution("")
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
