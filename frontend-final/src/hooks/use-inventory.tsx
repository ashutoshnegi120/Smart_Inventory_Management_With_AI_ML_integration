"use client"

import { useState, useEffect } from "react"
import type { InventoryItem } from "../types/types"
import { getInventoryData } from "../api/get/get"
import { mapApiResponseToInventoryItem } from "../Transformation"

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch inventory data from API (or fallback to localStorage)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getInventoryData()
        const response : InventoryItem[] = mapApiResponseToInventoryItem(res)


        if (response && response.length > 0) {
          setInventory(response)
          localStorage.setItem("inventory", JSON.stringify(response))
        } else {
          // fallback if API gives no data
          const stored = localStorage.getItem("inventory")
          if (stored) {
            setInventory(JSON.parse(stored))
          }
        }
      } catch (error: unknown) {
        console.error("Failed to fetch inventory:", error)

        // Fallback to localStorage if API fails
        const stored = localStorage.getItem("inventory")
        if (stored) {
          setInventory(JSON.parse(stored))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("inventory", JSON.stringify(inventory))
    }
  }, [inventory, loading])

  const addItem = (item: InventoryItem) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
    }
    setInventory(prev => [...prev, newItem])
  }

  const updateItem = (updatedItem: InventoryItem) => {
    setInventory(prev =>
      prev.map(item => (item.id === updatedItem.id ? updatedItem : item))
    )
  }

  const deleteItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id))
  }

  const lowStockItems = inventory.filter(item => item.status === "Low Stock")
  const outOfStockItems = inventory.filter(item => item.status === "Out of Stock")

  return {
    inventory,
    loading,
    addItem,
    updateItem,
    deleteItem,
    lowStockItems,
    outOfStockItems,
  }
}
