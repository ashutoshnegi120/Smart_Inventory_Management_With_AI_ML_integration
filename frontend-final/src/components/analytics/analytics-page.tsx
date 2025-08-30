"use client"

import { useState } from "react"
import { Calendar, TrendingUp, DollarSign, Package, PieChart, LineChart, ArrowUp, ArrowDown } from "lucide-react"
import {
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useAuth } from "../../contexts/auth-context"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("month")
  const { user } = useAuth()

  // Sample data for charts
  const salesData = [
    { name: "Jan", sales: 4000, profit: 2400 },
    { name: "Feb", sales: 3000, profit: 1398 },
    { name: "Mar", sales: 2000, profit: 9800 },
    { name: "Apr", sales: 2780, profit: 3908 },
    { name: "May", sales: 1890, profit: 4800 },
    { name: "Jun", sales: 2390, profit: 3800 },
    { name: "Jul", sales: 3490, profit: 4300 },
    { name: "Aug", sales: 4000, profit: 2400 },
    { name: "Sep", sales: 3000, profit: 1398 },
    { name: "Oct", sales: 2000, profit: 9800 },
    { name: "Nov", sales: 2780, profit: 3908 },
    { name: "Dec", sales: 1890, profit: 4800 },
  ]

  const categoryData = [
    { name: "Electronics", value: 400 },
    { name: "Furniture", value: 300 },
    { name: "Clothing", value: 300 },
    { name: "Books", value: 200 },
    { name: "Other", value: 100 },
  ]

  const topProducts = [
    { name: "Product A", sales: 124 },
    { name: "Product C", sales: 98 },
    { name: "Product E", sales: 87 },
    { name: "Product B", sales: 76 },
    { name: "Product D", sales: 65 },
  ]

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">AI-powered insights for your inventory</p>
        </div>
        <div className="mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
            <option value="year">Last 12 months</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-800">$24,780</p>
                <span className="ml-2 flex items-center text-sm font-medium text-green-600">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  12%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Items Sold</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-800">432</p>
                <span className="ml-2 flex items-center text-sm font-medium text-green-600">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  8%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-800">$57.32</p>
                <span className="ml-2 flex items-center text-sm font-medium text-green-600">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  3%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-800">8</p>
                <span className="ml-2 flex items-center text-sm font-medium text-red-600">
                  <ArrowUp className="h-4 w-4 mr-1" />2
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Sales Trend</h3>
            <div className="flex items-center">
              <LineChart className="h-5 w-5 text-gray-400 mr-1" />
              <span className="text-sm text-gray-500">Last 30 days</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={salesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Category Distribution</h3>
            <div className="flex items-center">
              <PieChart className="h-5 w-5 text-gray-400 mr-1" />
              <span className="text-sm text-gray-500">By revenue</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">AI-Powered Insights</h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 border border-green-100 rounded-lg bg-green-50">
            <div className="flex">
              <ArrowUp className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Positive Trend</h4>
                <p className="text-sm text-green-700">
                  Electronics category sales have increased by 24% compared to last month. Consider increasing inventory
                  for this category.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border border-yellow-100 rounded-lg bg-yellow-50">
            <div className="flex">
              <ArrowDown className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Inventory Alert</h4>
                <p className="text-sm text-yellow-700">
                  Based on current sales velocity, "Product B" will be out of stock in approximately 7 days. Consider
                  restocking soon.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border border-indigo-100 rounded-lg bg-indigo-50">
            <div className="flex">
              <TrendingUp className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-indigo-800">Sales Prediction</h4>
                <p className="text-sm text-indigo-700">
                  Based on historical data and current trends, we predict a 15% increase in overall sales next month.
                  Prepare inventory accordingly.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 italic">
          Note: These insights are generated using simulated AI analysis for demonstration purposes.
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Selling Products</h3>
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
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Units Sold
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Revenue
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{index % 2 === 0 ? "Electronics" : "Clothing"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{product.sales}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${(product.sales * 200).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="flex items-center text-sm font-medium text-green-600">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      {Math.floor(Math.random() * 10) + 2}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
