"use client"

import { Link } from "react-router-dom"
import {
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  BarChart3,
  X,
  User,
  Calendar,
  MessageSquare,
  DollarSign,
  ShoppingBag,
} from "lucide-react"
import { useAuth } from "../contexts/auth-context"

interface SidebarProps {
  currentPath: string
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (isOpen: boolean) => void
}

export default function Sidebar({ currentPath, isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const navItems = [
    { path: "inventory", label: "Inventory", icon: Package, role: ["admin", "employee"] },
    { path: "pos", label: "Point of Sale", icon: ShoppingBag, role: ["admin", "employee"] },
    { path: "orders", label: "Orders", icon: ShoppingCart, role: ["admin", "employee"] },
    { path: "employees", label: "Employees", icon: Users, role: ["admin"] },
    { path: "analytics", label: "Analytics", icon: BarChart3, role: ["admin", "employee"] },
    { path: "sales", label: "Sales Dashboard", icon: DollarSign, role: ["employee"] },
    { path: "leave", label: "Leave Management", icon: Calendar, role: ["admin", "employee"] },
    { path: "complaints", label: "Complaints", icon: MessageSquare, role: ["admin", "employee"] },
    { path: "profile", label: "My Profile", icon: User, role: ["admin", "employee"] },
    { path: "settings", label: "Settings", icon: Settings, role: ["admin", "employee"] },
  ]

  // Filter out items based on user role
  const filteredNavItems = navItems.filter((item) => item.role.includes(user?.role || ""))

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-indigo-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold">Inventory System</h1>
          </div>
          <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center space-x-3 mb-6 bg-indigo-900 p-3 rounded-lg">
            <div className="flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full"
                src={user?.avatar || "/placeholder.svg?height=40&width=40"}
                alt={user?.name || "User"}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-indigo-300 truncate">
                {user?.role === "admin" ? "Administrator" : "Employee"}
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-2 px-2">
          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={`/dashboard/${item.path}`}
                className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                  currentPath === item.path ? "bg-indigo-900 text-white" : "text-indigo-100 hover:bg-indigo-700"
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-8 mt-8 border-t border-indigo-700">
            <button
              className="flex items-center px-4 py-3 text-sm rounded-md text-indigo-100 hover:bg-indigo-700 w-full transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  )
}
