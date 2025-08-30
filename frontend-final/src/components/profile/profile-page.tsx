"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../../contexts/auth-context"
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Building, Save, Camera } from "lucide-react"

export default function ProfilePage() {
    const { user, updateUserProfile } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        contactNumber: user?.contactNumber || "",
        address: user?.address || "",
        department: user?.department || "",
        position: user?.position || "",
        emergencyContact: user?.emergencyContact || "",
        avatar: user?.avatar || "",
    })
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateUserProfile(formData)
        setIsEditing(false)
    }

    if (!user) {
        return <div>Loading profile...</div>
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">My Profile</h1>
                    <p className="text-gray-600 mt-1">View and manage your personal information</p>
                </div>
                <div className="mt-4 md:mt-0">
                    {isEditing ? (
                        <button
                            onClick={handleSubmit}
                            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            <Save className="h-5 w-5 mr-2" />
                            Save Changes
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            <User className="h-5 w-5 mr-2" />
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="md:flex">
                    {/* Profile Sidebar */}
                    <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-200">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-4xl font-bold overflow-hidden">
                                    {formData.avatar ? (
                                        <img
                                            src={formData.avatar || "/placeholder.svg"}
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        user.name.charAt(0)
                                    )}
                                </div>
                                {isEditing && (
                                    <div className="absolute bottom-0 right-0">
                                        <label
                                            htmlFor="avatar-upload"
                                            className="cursor-pointer bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700"
                                        >
                                            <Camera className="h-5 w-5" />
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        const reader = new FileReader()
                                                        reader.onloadend = () => {
                                                            setFormData({
                                                                ...formData,
                                                                avatar: reader.result as string,
                                                            })
                                                        }
                                                        reader.readAsDataURL(file)
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">{user.name}</h2>
                            <p className="text-indigo-600">{user.role === "admin" ? "Administrator" : "Employee"}</p>

                            <div className="mt-6 w-full">
                                <div className="flex items-center py-2">
                                    <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Joined</p>
                                        <p className="text-sm font-medium">{user.joinDate || "Not specified"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center py-2">
                                    <Building className="h-5 w-5 text-gray-500 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Department</p>
                                        <p className="text-sm font-medium">{user.department || "Not specified"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center py-2">
                                    <Briefcase className="h-5 w-5 text-gray-500 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Position</p>
                                        <p className="text-sm font-medium">{user.position || "Not specified"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center py-2">
                                    <div className="h-5 w-5 flex items-center justify-center text-gray-500 mr-3">
                                        <span className="text-sm font-bold">L</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Leave Balance</p>
                                        <p className="text-sm font-medium">{user.leaveBalance || 0} days</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="md:w-2/3 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center">
                                            <User className="h-5 w-5 text-gray-400 mr-2" />
                                            <p className="text-gray-800">{user.name}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            disabled
                                        />
                                    ) : (
                                        <div className="flex items-center">
                                            <Mail className="h-5 w-5 text-gray-400 mr-2" />
                                            <p className="text-gray-800">{user.email}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Number
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            id="contactNumber"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center">
                                            <Phone className="h-5 w-5 text-gray-400 mr-2" />
                                            <p className="text-gray-800">{user.contactNumber || "Not specified"}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            id="address"
                                            name="address"
                                            rows={3}
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-start">
                                            <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                            <p className="text-gray-800">{user.address || "Not specified"}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                                        Emergency Contact
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            id="emergencyContact"
                                            name="emergencyContact"
                                            value={formData.emergencyContact}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center">
                                            <Phone className="h-5 w-5 text-gray-400 mr-2" />
                                            <p className="text-gray-800">{user.emergencyContact || "Not specified"}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                            Department
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                id="department"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        ) : (
                                            <div className="flex items-center">
                                                <Building className="h-5 w-5 text-gray-400 mr-2" />
                                                <p className="text-gray-800">{user.department || "Not specified"}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                                            Position
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                id="position"
                                                name="position"
                                                value={formData.position}
                                                onChange={handleChange}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        ) : (
                                            <div className="flex items-center">
                                                <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                                                <p className="text-gray-800">{user.position || "Not specified"}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
