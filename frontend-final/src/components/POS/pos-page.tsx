"use client"

import { useState } from "react"
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, DollarSign } from "lucide-react"
import { useInventory } from "../../hooks/use-inventory"
import type { InventoryItem } from "../../types/types"
import SaleCompleteModal from "./sale-complete-modal"

export default function POSPage() {
    const { inventory, loading, updateItem } = useInventory()
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState<string>("")
    const [cart, setCart] = useState<Array<{ item: InventoryItem; quantity: number }>>([])
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash")
    const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "" })
    const [saleComplete, setSaleComplete] = useState(false)
    const [receiptData, setReceiptData] = useState<any>(null)

    // Get unique categories for filter dropdown
    const categories = [...new Set(inventory.map((item) => item.category))].sort()

    // Filter inventory based on search term and category filter
    const filteredInventory = inventory.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory = categoryFilter ? item.category === categoryFilter : true

        return matchesSearch && matchesCategory
    })

    // Calculate cart totals
    const subtotal = cart.reduce((sum, cartItem) => sum + cartItem.item.price * cartItem.quantity, 0)
    const tax = subtotal * 0.08 // 8% tax rate
    const total = subtotal + tax

    const addToCart = (item: InventoryItem) => {
        // Check if we have enough inventory
        if (item.quantity <= 0) {
            alert("This item is out of stock")
            return
        }

        // Check if item is already in cart
        const existingCartItemIndex = cart.findIndex((cartItem) => cartItem.item.id === item.id)

        if (existingCartItemIndex >= 0) {
            // Item exists in cart, update quantity if we have enough inventory
            const existingItem = cart[existingCartItemIndex]
            if (existingItem.quantity >= item.quantity) {
                alert("Cannot add more of this item - not enough in stock")
                return
            }

            const updatedCart = [...cart]
            updatedCart[existingCartItemIndex] = {
                ...existingItem,
                quantity: existingItem.quantity + 1,
            }
            setCart(updatedCart)
        } else {
            // Item doesn't exist in cart, add it
            setCart([...cart, { item, quantity: 1 }])
        }
    }

    const updateCartItemQuantity = (index: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            // Remove item if quantity is 0 or negative
            const updatedCart = [...cart]
            updatedCart.splice(index, 1)
            setCart(updatedCart)
            return
        }

        // Check if we have enough inventory
        const item = cart[index].item
        if (newQuantity > item.quantity) {
            alert("Cannot add more of this item - not enough in stock")
            return
        }

        // Update quantity
        const updatedCart = [...cart]
        updatedCart[index] = {
            ...updatedCart[index],
            quantity: newQuantity,
        }
        setCart(updatedCart)
    }

    const removeFromCart = (index: number) => {
        const updatedCart = [...cart]
        updatedCart.splice(index, 1)
        setCart(updatedCart)
    }

    const handleCheckout = () => {
        // Create receipt data
        const receipt = {
            id: `INV-${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString(),
            items: cart.map((cartItem) => ({
                name: cartItem.item.name,
                quantity: cartItem.quantity,
                price: cartItem.item.price,
                total: cartItem.item.price * cartItem.quantity,
            })),
            subtotal,
            tax,
            total,
            paymentMethod,
            customer: customerInfo,
        }

        // Update inventory quantities
        cart.forEach((cartItem) => {
            const updatedItem = {
                ...cartItem.item,
                quantity: cartItem.item.quantity - cartItem.quantity,
            }

            // Update status based on new quantity
            if (updatedItem.quantity === 0) {
                updatedItem.status = "Out of Stock"
            } else if (updatedItem.quantity <= 10) {
                updatedItem.status = "Low Stock"
            }

            updateItem(updatedItem)
        })

        // Save receipt data and show completion modal
        setReceiptData(receipt)
        setSaleComplete(true)

        // Clear cart
        setCart([])
    }

    const handleNewSale = () => {
        setSaleComplete(false)
        setReceiptData(null)
        setCustomerInfo({ name: "", email: "", phone: "" })
        setPaymentMethod("cash")
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="ml-3 text-gray-600">Loading inventory...</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Point of Sale</h1>
                    <p className="text-gray-600 mt-1">Process sales and manage inventory</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Listing */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="flex-1">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                    Search Products
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="search"
                                        placeholder="Search by name, category, or SKU..."
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="w-full md:w-48">
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            {filteredInventory.map((item) => (
                                <div
                                    key={item.id}
                                    className={`border rounded-lg p-4 flex flex-col ${item.quantity <= 0 ? "bg-gray-100 opacity-70" : "hover:border-indigo-500 cursor-pointer"
                                        }`}
                                    onClick={() => item.quantity > 0 && addToCart(item)}
                                >
                                    <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md mb-3">
                                        {item.image ? (
                                            <img
                                                src={item.image || "/placeholder.svg"}
                                                alt={item.name}
                                                className="h-full w-full object-contain rounded-md"
                                            />
                                        ) : (
                                            <div className="text-4xl font-bold text-gray-300">{item.name.charAt(0)}</div>
                                        )}
                                    </div>
                                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                                    <p className="text-sm text-gray-500 mb-1">SKU: {item.sku || "N/A"}</p>
                                    <div className="flex justify-between items-center mt-auto">
                                        <span className="text-lg font-bold text-indigo-600">${item.price.toFixed(2)}</span>
                                        <span
                                            className={`text-sm px-2 py-1 rounded-full ${item.status === "In Stock"
                                                    ? "bg-green-100 text-green-800"
                                                    : item.status === "Low Stock"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {item.quantity} in stock
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {filteredInventory.length === 0 && (
                                <div className="col-span-full text-center py-8 text-gray-500">
                                    No products found. Try adjusting your search or filters.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Shopping Cart */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-4 rounded-lg shadow-sm sticky top-4">
                        <div className="flex items-center mb-4">
                            <ShoppingCart className="h-5 w-5 text-indigo-600 mr-2" />
                            <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                        </div>

                        {cart.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                <p>Your cart is empty</p>
                                <p className="text-sm">Add products to begin a sale</p>
                            </div>
                        ) : (
                            <>
                                <div className="max-h-96 overflow-y-auto mb-4">
                                    {cart.map((cartItem, index) => (
                                        <div key={cartItem.item.id} className="flex items-center py-3 border-b">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-gray-900">{cartItem.item.name}</h3>
                                                <p className="text-sm text-gray-500">${cartItem.item.price.toFixed(2)} each</p>
                                            </div>
                                            <div className="flex items-center">
                                                <button
                                                    className="p-1 text-gray-500 hover:text-gray-700"
                                                    onClick={() => updateCartItemQuantity(index, cartItem.quantity - 1)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="mx-2 w-8 text-center">{cartItem.quantity}</span>
                                                <button
                                                    className="p-1 text-gray-500 hover:text-gray-700"
                                                    onClick={() => updateCartItemQuantity(index, cartItem.quantity + 1)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="ml-2 p-1 text-red-500 hover:text-red-700"
                                                    onClick={() => removeFromCart(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax (8%)</span>
                                        <span className="font-medium">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-medium pt-2 border-t">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-indigo-600">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                                    onClick={() => setIsCheckoutModalOpen(true)}
                                >
                                    Proceed to Checkout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            {isCheckoutModalOpen && (
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
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Complete Sale</h3>
                                        <div className="mt-4">
                                            <div className="mb-4">
                                                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Customer Name (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    id="customerName"
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={customerInfo.name}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Customer Email (Optional)
                                                </label>
                                                <input
                                                    type="email"
                                                    id="customerEmail"
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={customerInfo.email}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Customer Phone (Optional)
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="customerPhone"
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={customerInfo.phone}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                                <div className="flex space-x-4">
                                                    <div
                                                        className={`flex-1 flex items-center justify-center p-3 border rounded-md cursor-pointer ${paymentMethod === "cash"
                                                                ? "bg-indigo-50 border-indigo-500"
                                                                : "border-gray-300 hover:bg-gray-50"
                                                            }`}
                                                        onClick={() => setPaymentMethod("cash")}
                                                    >
                                                        <DollarSign className="h-5 w-5 mr-2 text-indigo-600" />
                                                        <span>Cash</span>
                                                    </div>
                                                    <div
                                                        className={`flex-1 flex items-center justify-center p-3 border rounded-md cursor-pointer ${paymentMethod === "card"
                                                                ? "bg-indigo-50 border-indigo-500"
                                                                : "border-gray-300 hover:bg-gray-50"
                                                            }`}
                                                        onClick={() => setPaymentMethod("card")}
                                                    >
                                                        <CreditCard className="h-5 w-5 mr-2 text-indigo-600" />
                                                        <span>Card</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 bg-gray-50 p-4 rounded-md">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm text-gray-600">Subtotal</span>
                                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm text-gray-600">Tax (8%)</span>
                                                    <span className="font-medium">${tax.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-base font-medium pt-2 border-t">
                                                    <span className="text-gray-900">Total</span>
                                                    <span className="text-indigo-600">${total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleCheckout}
                                >
                                    Complete Sale
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setIsCheckoutModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sale Complete Modal */}
            <SaleCompleteModal isOpen={saleComplete} onClose={handleNewSale} receiptData={receiptData} />
        </div>
    )
}
