"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Save, User, Building, Bell, Shield, Database } from "lucide-react"
import { passwordChange } from "../../api/patch/patch"
import { useAuth } from "../../contexts/auth-context"

export default function SettingsPage() {
  const newPassword = useRef(null)
  const re_newPassword = useRef(null)
  const [activeTab, setActiveTab] = useState("general")
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    id: user?.id || "",
    companyName: user?.company_name || "",
    email: user?.email || "",
    phone: user?.contactNumber || "",
    address: user?.address || "",
    lowStockThreshold: 10,
    currency: "USD",
    dateFormat: user?.joinDate || "MM/DD/YYYY",
    enableNotifications: true,
    emailNotifications: true,
    stockAlerts: true,
    orderAlerts: true,
    darkMode: false,
    compactMode: false,
  })

  const password_change = (id: number, password: string, re_password: string) => {
    try {
      const response = passwordChange(id, password, re_password)
    } catch (error: unknown) {
      console.log(error)
    }

  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save to a backend
    alert("Settings saved successfully!")
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your system preferences</p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Settings Navigation */}
          <div className="w-full md:w-64 bg-gray-50 p-4 border-r border-gray-200">
            <nav className="space-y-1">
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${activeTab === "general" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                  }`}
                onClick={() => setActiveTab("general")}
              >
                <Building className="mr-3 h-5 w-5" />
                General
              </button>
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${activeTab === "account" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                  }`}
                onClick={() => setActiveTab("account")}
              >
                <User className="mr-3 h-5 w-5" />
                Account
              </button>
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${activeTab === "notifications" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                  }`}
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="mr-3 h-5 w-5" />
                Notifications
              </button>
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${activeTab === "inventory" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                  }`}
                onClick={() => setActiveTab("inventory")}
              >
                <Database className="mr-3 h-5 w-5" />
                Inventory Settings
              </button>
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${activeTab === "security" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                  }`}
                onClick={() => setActiveTab("security")}
              >
                <Shield className="mr-3 h-5 w-5" />
                Security
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6">
            <form onSubmit={handleSubmit}>
              {/* General Settings */}
              {activeTab === "general" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                          Currency
                        </label>
                        <select
                          id="currency"
                          name="currency"
                          value={formData.currency}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-1">
                          Date Format
                        </label>
                        <select
                          id="dateFormat"
                          name="dateFormat"
                          value={formData.dateFormat}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Settings */}
              {activeTab === "inventory" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Settings</h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                        Low Stock Threshold
                      </label>
                      <input
                        type="number"
                        id="lowStockThreshold"
                        name="lowStockThreshold"
                        min="0"
                        value={formData.lowStockThreshold}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Items with stock below this threshold will be marked as "Low Stock"
                      </p>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="stockAlerts"
                        name="stockAlerts"
                        checked={formData.stockAlerts}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="stockAlerts" className="ml-2 block text-sm text-gray-900">
                        Enable low stock alerts
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableNotifications"
                        name="enableNotifications"
                        checked={formData.enableNotifications}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-900">
                        Enable all notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        name="emailNotifications"
                        checked={formData.emailNotifications}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                        Send notifications via email
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="orderAlerts"
                        name="orderAlerts"
                        checked={formData.orderAlerts}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="orderAlerts" className="ml-2 block text-sm text-gray-900">
                        Notify on new orders
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeTab === "account" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="darkMode"
                        name="darkMode"
                        checked={formData.darkMode}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-900">
                        Enable dark mode
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="compactMode"
                        name="compactMode"
                        checked={formData.compactMode}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="compactMode" className="ml-2 block text-sm text-gray-900">
                        Enable compact mode
                      </label>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Reset Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>

                  <div className="space-y-4">

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        ref={newPassword}
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        ref={re_newPassword}
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => password_change(Number(formData.id), newPassword.current.value, re_newPassword.current.value)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Change Password
                    </button>

                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
