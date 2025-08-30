"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/auth-context"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Calendar, DollarSign, TrendingUp, Search } from "lucide-react"

export default function SalesDashboard() {
    const { user } = useAuth()
    const [timeRange, setTimeRange] = useState("week")
    const [searchTerm, setSearchTerm] = useState("")

    // Sample data for charts
    const dailySales = [
        { name: "Mon", sales: 1200 },
        { name: "Tue", sales: 1800 },
        { name: "Wed", sales: 1400 },
        { name: "Thu", sales: 2200 },
        { name: "Fri", sales: 1900 },
        { name: "Sat", sales: 2400 },
        { name: "Sun", sales: 1600 },
    ]

    const recentSales = [
        { id: 1, product: "Laptop", customer: "John Doe", amount: 1299, date: "2023-11-01" },
        { id: 2, product: "Smartphone", customer: "Jane Smith", amount: 899, date: "2023-11-01" },
        { id: 3, product: "Headphones", customer: "Bob Johnson", amount: 199, date: "2023-11-02" },
        { id: 4, product: "Monitor", customer: "Alice Brown", amount: 349, date: "2023-11-02" },
        { id: 5, product: "Keyboard", customer: "Charlie Wilson", amount: 129, date: "2023-11-03" },
    ]

    // Filter recent sales based on search term
    const filteredSales = recentSales.filter(
        (sale) =>
            sale.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.customer.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Calculate summary statistics
    const totalSales = dailySales.reduce((sum, item) => sum + item.sales, 0)
    const averageDailySales = Math.round(totalSales / dailySales.length)
    const todaySales = dailySales[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].sales

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Sales Dashboard</h1>
                    <p className="text-gray-600 mt-1">Track your daily sales performance</p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <option value="day">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Today's Sales</p>
                            <p className="text-2xl font-semibold text-gray-800">${todaySales.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Weekly Sales</p>
                            <p className="text-2xl font-semibold text-gray-800">${totalSales.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Avg. Daily Sales</p>
                            <p className="text-2xl font-semibold text-gray-800">${averageDailySales.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Sales Chart */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Daily Sales</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailySales} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                                <Legend />
                                <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Sales Table */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-800">Recent Sales</h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search sales..."
                                className="pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Product
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Customer
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Amount
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.product}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.customer}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${sale.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(sale.date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {filteredSales.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No sales found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
