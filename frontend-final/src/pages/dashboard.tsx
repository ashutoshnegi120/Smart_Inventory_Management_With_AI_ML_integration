"use client"

import { useState, useEffect } from "react"
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import Sidebar from "../components/sidebar"
import Header from "../components/header"
import InventoryPage from "../components/inventory/inventory-page"
import OrdersPage from "../components/orders/orders-page"
import EmployeesPage from "../components/employees/employees-page"
import SettingsPage from "../components/settings/settings-page"
import AnalyticsPage from "../components/analytics/analytics-page"
import ProfilePage from "../components/profile/profile-page"
import LeaveManagement from "../components/employee/leave-management"
import Complaints from "../components/employee/complaints"
import SalesDashboard from "../components/sales/sales-dashboard"
import POSPage from "../components/POS/pos-page"

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Determine current section from URL
  const currentPath = location.pathname.split("/")[2] || "inventory"

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        currentPath={currentPath}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} user={user} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/inventory" />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leave" element={<LeaveManagement />} />
            <Route path="/complaints" element={<Complaints />} />
            {/* Only show sales dashboard to employees */}
            {user?.role === "employee" && <Route path="/sales" element={<SalesDashboard />} />}
            <Route path="*" element={<Navigate to="/dashboard/inventory" />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
