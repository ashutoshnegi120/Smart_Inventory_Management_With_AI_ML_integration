"use client"

import React, { useEffect, useState } from "react"
import {
  PlusCircle,
  Filter,
  Download,
  Calendar,
  Clock,
  Package,
  DollarSign,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Minus,
} from "lucide-react"
import { getInventoryOrder } from "../../api/get/get"
import { createOrder } from "../../api/post/Post"
import { statusChange } from "../../api/patch/patch"

interface Order {
  order_id: number
  supplier_name: string
  product_id: string[]
  quantity_ordered: number[]
  price : number[]
  order_date: string
  status: string
}

interface OrdersResponse {
  orders: Order[]
}

interface EditingOrder extends Order {
  isEditing: boolean
}

interface NewOrderProduct {
  name: string
  quantity: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [editingOrders, setEditingOrders] = useState<{ [key: number]: EditingOrder }>({})
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false)
  const [newOrderSupplier, setNewOrderSupplier] = useState("")
  const [priceArray , setpriceArray] = useState<number[]>([])
  const [categories,setCategories] = useState<string[]>([])
  const [newOrderProducts, setNewOrderProducts] = useState<NewOrderProduct[]>([{ name: "", quantity: 1 }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const mockData: OrdersResponse = await getInventoryOrder()
        setOrders(mockData.orders)
      } catch (err) {
        const typedError = err as Error
        console.error(typedError.message)
      }
    }

    fetchOrders()
  }, [])

  const toggleRowExpansion = (orderId: number) => {
    setExpandedRows((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const handleView = (order: Order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleEdit = (order: Order) => {
    setEditingOrders((prev) => ({
      ...prev,
      [order.order_id]: { ...order, isEditing: true },
    }))
  }

  const handleSave = (orderId: number) => {

    const editedOrder = editingOrders[orderId]
    if (editedOrder) {
      setOrders((prev) =>
        prev.map((order) => (order.order_id === orderId ? { ...editedOrder, isEditing: false } : order)),
      )
      setEditingOrders((prev) => {
        const newState = { ...prev }
        delete newState[orderId]
        return newState
      })
    }
    statusChange(orderId, editedOrder.status);
  }

  const handleCancel = (orderId: number) => {
    setEditingOrders((prev) => {
      const newState = { ...prev }
      delete newState[orderId]
      return newState
    })
  }

  const handleProductChange = (orderId: number, index: number, value: string) => {
    setEditingOrders((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        product_id: prev[orderId].product_id.map((p, i) => (i === index ? value : p)),
      },
    }))
  }

  const handleQuantityChange = (orderId: number, index: number, value: number) => {
    setEditingOrders((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        quantity_ordered: prev[orderId].quantity_ordered.map((q, i) => (i === index ? value : q)),
      },
    }))
  }

  const handleStatusChange = (orderId: number, status: string) => {
    setEditingOrders((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        status,
      },
    }))
  }

  const handleNewOrderOpen = () => {
    setIsNewOrderModalOpen(true)
    setNewOrderSupplier("")
    setNewOrderProducts([{ name: "", quantity: 1 }])
    setSubmitError("")
  }

  const handleAddProduct = () => {
    setNewOrderProducts([...newOrderProducts, { name: "", quantity: 1 }])
  }

  const handleRemoveProduct = (index: number) => {
    if (newOrderProducts.length > 1) {
      setNewOrderProducts(newOrderProducts.filter((_, i) => i !== index))
    }
  }

  const handleNewProductChange = (index: number, field: "name" | "quantity", value: string | number) => {
    const updatedProducts = [...newOrderProducts]
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
    }
    setNewOrderProducts(updatedProducts)
  }

  const handleSubmitNewOrder = async () => {
    // Validate form
    if (!newOrderSupplier.trim()) {
      setSubmitError("Please enter a supplier name")
      return
    }

    const invalidProducts = newOrderProducts.some((p) => !p.name.trim() || p.quantity <= 0)
    if (invalidProducts) {
      setSubmitError("Please enter valid product names and quantities")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Format data for API
      const productsObject: { [key: string]: number } = {}
      newOrderProducts.forEach((product) => {
        productsObject[product.name] = product.quantity
      })

      const orderData = {
        supplier_name: newOrderSupplier,
        products: productsObject,
        categories : categories,
        price : priceArray
      }

      // Call API
      await createOrder(orderData)

      // Refresh orders list
      const updatedOrders = await getInventoryOrder()
      setOrders(updatedOrders.orders)

      // Close modal
      setIsNewOrderModalOpen(false)
    } catch (error) {
      console.error("Failed to create order:", error)
      setSubmitError("Failed to create order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter ? order.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

  // Calculate summary statistics
  const totalOrders = orders.length
  const totalItems = orders.reduce((sum, order) => sum + order.quantity_ordered.reduce((a, b) => a + b, 0), 0)
  const pendingOrders = orders.filter((order) => order.status === "pending").length
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Orders Management</h1>
          <p className="text-gray-600 mt-1">View and manage supplier orders</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <button
            onClick={handleNewOrderOpen}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            New Order
          </button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-800">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-semibold text-gray-800">{totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Orders</p>
              <p className="text-2xl font-semibold text-gray-800">{pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Delivered Orders</p>
              <p className="text-2xl font-semibold text-gray-800">{deliveredOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by order ID or supplier name..."
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Order ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Supplier
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const isExpanded = expandedRows.includes(order.order_id)
                  const isEditing = editingOrders[order.order_id]

                  return (
                    <React.Fragment key={order.order_id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleRowExpansion(order.order_id)}
                              className="mr-2 text-gray-500 hover:text-gray-700"
                              aria-label={isExpanded ? "Collapse row" : "Expand row"}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            <div className="text-sm font-medium text-indigo-600">#{order.order_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.supplier_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{new Date(order.order_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing ? (
                            <select
                              value={isEditing.status}
                              onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                              className="block w-full pl-3 pr-10 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.status === "processing"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSave(order.order_id)}
                                className="text-green-600 hover:text-green-900 mr-3"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => handleCancel(order.order_id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleView(order)}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                View
                              </button>
                              {order.status === "pending" && (
                                <button onClick={() => handleEdit(order)} className="text-gray-600 hover:text-gray-900">
                                  Edit
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Products and Quantities</h4>
                                {isEditing ? (
                                  <div className="space-y-2">
                                    {isEditing.product_id.map((product, index) => (
                                      <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                        <input
                                          type="text"
                                          value={product}
                                          onChange={(e) => handleProductChange(order.order_id, index, e.target.value)}
                                          className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                          placeholder="Product name"
                                        />
                                        <input
                                          type="number"
                                          value={isEditing.quantity_ordered[index]}
                                          onChange={(e) =>
                                            handleQuantityChange(order.order_id, index, Number.parseInt(e.target.value))
                                          }
                                          className="w-full sm:w-24 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                          min="1"
                                          placeholder="Qty"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {order.product_id.map((product, index) => (
                                      <div
                                        key={index}
                                        className="text-sm text-gray-600 bg-white p-3 rounded-md shadow-sm"
                                      >
                                        <span className="font-medium">{product}:</span> {order.quantity_ordered[index]}{" "}
                                        units
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No orders found. Create a new order to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-gray-700 mb-2 sm:mb-0">
              Showing <span className="font-medium">{filteredOrders.length}</span> orders
            </div>
            <div className="flex justify-center sm:justify-end w-full sm:w-auto">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  1
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 flex justify-between items-center px-6 py-4 border-b bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-500">Order ID</p>
                  <p className="text-lg font-semibold text-gray-900">#{selectedOrder.order_id}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-500">Supplier</p>
                  <p className="text-lg text-gray-900">{selectedOrder.supplier_name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-500">Order Date</p>
                  <p className="text-lg text-gray-900">{new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span
                    className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full 
                    ${selectedOrder.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : selectedOrder.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedOrder.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                      }`}
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedOrder.product_id.map((product, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                        <div className="text-sm font-medium text-gray-900">{product}</div>
                        <div className="text-sm text-gray-600 font-semibold">
                          {selectedOrder.quantity_ordered[index]} units
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="h-full w-0.5 bg-gray-200"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Created</p>
                      <p className="text-xs text-gray-500">{new Date(selectedOrder.order_date).toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedOrder.status !== "pending" && (
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="h-full w-0.5 bg-gray-200"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Processing Started</p>
                        <p className="text-xs text-gray-500">Status updated to processing</p>
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === "delivered" && (
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order Delivered</p>
                        <p className="text-xs text-gray-500">Status updated to delivered</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 flex justify-between items-center px-6 py-4 border-b bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-800">Create New Order</h2>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              {submitError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="supplier_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    id="supplier_name"
                    value={newOrderSupplier}
                    onChange={(e) => setNewOrderSupplier(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter supplier name"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Products *</label>
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Product
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newOrderProducts.map((product, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-grow">
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => handleNewProductChange(index, "name", e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Product name"
                            required
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={product.quantity}
                            onChange={(e) =>
                              handleNewProductChange(index, "quantity", Number.parseInt(e.target.value) || 0)
                            }
                            className="block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Qty"
                            min="1"
                            required
                          />
                          {newOrderProducts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(index)}
                              className="ml-2 text-red-600 hover:text-red-800"
                              aria-label="Remove product"
                            >
                              <Minus className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitNewOrder}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
