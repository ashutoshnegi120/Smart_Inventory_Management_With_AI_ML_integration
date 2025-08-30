"use client"

import { useEffect, useState } from "react"
import { PlusCircle, Filter, Download, RefreshCw, AlertTriangle } from "lucide-react"
import InventoryTable from "./inventory-table"
import AddEditItemModal from "./add-edit-item-modal"
import DeleteConfirmModal from "./delete-confirm-modal"
import { useInventory } from "../../hooks/use-inventory"
import type { InventoryItem } from "../../types/types"
import AIRecommendations from "./ai-recommendations"
import { getCat } from "../../FastAPI/FastAPI"

export default function InventoryPage() {
  const { inventory, loading, addItem, updateItem, deleteItem, lowStockItems, outOfStockItems } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null)
  const [showAIRecommendations, setShowAIRecommendations] = useState(false)
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    getCat().then(setCategories);
  }, []);
  
  // Filter inventory based on search term and filters
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter ? item.category === categoryFilter : true
    const matchesStatus = statusFilter ? item.status === statusFilter : true

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddItem = (item: InventoryItem) => {
    addItem(item)
    setIsAddModalOpen(false)
  }

  const handleUpdateItem = (item: InventoryItem) => {
    updateItem(item)
    setCurrentItem(null)
  }

  const handleDeleteItem = () => {
    if (currentItem) {
      deleteItem(currentItem.id)
      setIsDeleteModalOpen(false)
      setCurrentItem(null)
    }
  }

  const openEditModal = (item: InventoryItem) => {
    setCurrentItem(item)
  }

  const openDeleteModal = (item: InventoryItem) => {
    setCurrentItem(item)
    setIsDeleteModalOpen(true)
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Manage your products and stock levels</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <button
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add New Item
          </button>
          <button
            className="flex items-center bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            onClick={() => setShowAIRecommendations(!showAIRecommendations)}
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            {showAIRecommendations ? "Hide AI Insights" : "Show AI Insights"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Low stock alert:</span> {lowStockItems.length} items are running low on
                stock.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {showAIRecommendations && (
        <div className="mb-6">
          <AIRecommendations inventory={inventory} lowStockItems={lowStockItems} outOfStockItems={outOfStockItems} />
        </div>
      )}

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
                placeholder="Search by name, category, or SKU..."
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
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

      {/* Inventory Table */}
      <InventoryTable
        inventory={filteredInventory}
        loading={loading}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
      />

      {/* Add/Edit Modal */}
      {(isAddModalOpen || currentItem) && (
        <AddEditItemModal
          isOpen={isAddModalOpen || !!currentItem}
          onClose={() => {
            setIsAddModalOpen(false)
            setCurrentItem(null)
          }}
          onSave={currentItem ? handleUpdateItem : handleAddItem}
          item={currentItem}
          categories={categories}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentItem && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteItem}
          itemName={currentItem.name}
        />
      )}
    </div>
  )
}
