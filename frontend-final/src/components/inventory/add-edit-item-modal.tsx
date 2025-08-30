"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { InventoryItem } from "../../types"

interface AddEditItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: InventoryItem) => void
  item: InventoryItem | null
  categories: string[]
}

export default function AddEditItemModal({ isOpen, onClose, onSave, item, categories }: AddEditItemModalProps) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    sku: "",
    quantity: 0,
    price: 0,
    description: "",
    status: "In Stock",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newCategory, setNewCategory] = useState("")
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({ ...item })
    } else {
      setFormData({
        name: "",
        category: "",
        sku: "",
        quantity: 0,
        price: 0,
        description: "",
        status: "In Stock",
      })
    }
  }, [item])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "quantity" || name === "price") {
      setFormData({
        ...formData,
        [name]: Number.parseFloat(value) || 0,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setFormData({
        ...formData,
        category: newCategory.trim(),
      })
      setNewCategory("")
      setShowNewCategoryInput(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.category?.trim()) {
      newErrors.category = "Category is required"
    }

    if (formData.price === undefined || formData.price < 0) {
      newErrors.price = "Price must be a positive number"
    }

    if (formData.quantity === undefined || formData.quantity < 0) {
      newErrors.quantity = "Quantity must be a positive number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Determine status based on quantity
    let status = "In Stock"
    if (formData.quantity === 0) {
      status = "Out of Stock"
    } else if (formData.quantity && formData.quantity <= 10) {
      status = "Low Stock"
    }

    const itemToSave: InventoryItem = {
      id: item?.id || Date.now().toString(),
      name: formData.name || "",
      category: formData.category || "",
      sku: formData.sku || "",
      quantity: formData.quantity || 0,
      price: formData.price || 0,
      description: formData.description || "",
      status,
      image: formData.image || "",
    }

    onSave(itemToSave)
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
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{item ? "Edit Item" : "Add New Item"}</h3>
              <button type="button" className="text-gray-400 hover:text-gray-500" onClick={onClose}>
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                {showNewCategoryInput ? (
                  <div className="flex">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter new category"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <div className="flex">
                    <select
                      id="category"
                      name="category"
                      value={formData.category || ""}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.category ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(true)}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      New Category
                    </button>
                  </div>
                )}
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku || ""}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="0"
                    value={formData.quantity || 0}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.quantity ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price || 0}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description || ""}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image || ""}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                >
                  {item ? "Save Changes" : "Add Item"}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
