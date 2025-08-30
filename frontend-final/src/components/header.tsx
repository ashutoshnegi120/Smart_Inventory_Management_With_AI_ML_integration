"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Bell, Menu, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "employee"
  avatar?: string
}

interface HeaderProps {
  setIsMobileMenuOpen: (isOpen: boolean) => void
  user: User | null
}

export default function Header({ setIsMobileMenuOpen, user }: HeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const { logout } = useAuth()
  const navigate = useNavigate()

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Mock notifications
  const notifications = [
    { id: 1, message: "Low stock alert: Product B", time: "5 minutes ago", read: false },
    { id: 2, message: "New order received #1234", time: "1 hour ago", read: false },
    { id: 3, message: "Inventory update completed", time: "3 hours ago", read: true },
  ]

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button
            className="lg:hidden p-2 mr-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="relative w-64 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              className="p-2 rounded-full hover:bg-gray-100 relative"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell className="h-5 w-5 text-gray-500" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-2 hover:bg-gray-50 ${!notification.read ? "bg-blue-50" : ""}`}
                      >
                        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No new notifications</div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <button className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <img
                className="h-8 w-8 rounded-full"
                src={user?.avatar || "/placeholder.svg?height=32&width=32"}
                alt={user?.name || "User"}
              />
              <span className="hidden md:block font-medium text-gray-700">{user?.name || "User"}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Your Profile
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
