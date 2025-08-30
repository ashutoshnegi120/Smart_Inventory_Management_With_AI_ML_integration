"use client"

import type React from "react"

import { useState, type FormEvent } from "react"
import { X, User, Eye, EyeOff } from "lucide-react"
import { useAuth } from "../../contexts/auth-context"

interface AddEmployeeModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
    const { addEmployee } = useAuth()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: " ",
        department: "Warehouse",
        position: "Associate",
        contactNumber: "",
        address: "",
        leaveBalance: 20,
        role: "employee" as "admin" | "employee",
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: name === "leaveBalance" ? Number.parseInt(value) || 0 : value,
        })
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            // Validate form
            if (!formData.name || !formData.email || !formData.password) {
                throw new Error("Please fill in all required fields")
            }

            if (formData.password.length < 6) {
                throw new Error("Password must be at least 6 characters long")
            }

            const success = await addEmployee({
                ...formData,
                role: "employee",
            })

            if (success) {
                onSuccess()
                onClose()
            } else {
                setError("Failed to add employee. Email may already be in use.")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                    &#8203;
                </span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                                <User className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Employee</h3>
                                <div className="mt-4">
                                    <form onSubmit={handleSubmit}>
                                        {error && (
                                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                                <div className="flex">
                                                    <div>
                                                        <p className="text-sm text-red-700">{error}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="col-span-2">
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="col-span-2 relative">
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Password *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        id="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        required
                                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                                        ) : (
                                                            <Eye className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Department
                                                </label>
                                                <select
                                                    id="department"
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                >
                                                    <option value="Warehouse">Warehouse</option>
                                                    <option value="Sales">Sales</option>
                                                    <option value="IT">IT</option>
                                                    <option value="Administration">Administration</option>
                                                    <option value="Finance">Finance</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Position
                                                </label>
                                                <input
                                                    type="text"
                                                    id="position"
                                                    name="position"
                                                    value={formData.position}
                                                    onChange={handleChange}
                                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Contact Number
                                                </label>
                                                <input
                                                    type="text"
                                                    id="contactNumber"
                                                    name="contactNumber"
                                                    value={formData.contactNumber}
                                                    onChange={handleChange}
                                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="leaveBalance" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Leave Balance
                                                </label>
                                                <input
                                                    type="number"
                                                    id="leaveBalance"
                                                    name="leaveBalance"
                                                    value={formData.leaveBalance}
                                                    onChange={handleChange}
                                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Address
                                                </label>
                                                <textarea
                                                    id="address"
                                                    name="address"
                                                    rows={3}
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                                            <button
                                                type="button"
                                                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                                onClick={onClose}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                {loading ? "Adding..." : "Add Employee"}
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
    )
}
