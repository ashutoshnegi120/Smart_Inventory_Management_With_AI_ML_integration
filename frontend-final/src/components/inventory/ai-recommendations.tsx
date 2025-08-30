"use client"

import { useState, useEffect } from "react"
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react"
import type { InventoryItem } from "../../types"

interface AIRecommendationsProps {
  inventory: InventoryItem[]
  lowStockItems: InventoryItem[]
  outOfStockItems: InventoryItem[]
}

export default function AIRecommendations({ inventory, lowStockItems, outOfStockItems }: AIRecommendationsProps) {
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    // Simulate AI processing
    setLoading(true)
    setTimeout(() => {
      generateRecommendations()
      setLoading(false)
    }, 1500)
  }, [inventory, lowStockItems, outOfStockItems])

  const generateRecommendations = () => {
    const newRecommendations: string[] = []
    const newInsights: string[] = []

    // Generate restock recommendations
    if (lowStockItems.length > 0) {
      newRecommendations.push(
        `Restock ${lowStockItems.length} items that are running low, especially ${lowStockItems[0].name} (only ${lowStockItems[0].quantity} left).`,
      )
    }

    if (outOfStockItems.length > 0) {
      newRecommendations.push(
        `Order ${outOfStockItems.map((item) => item.name).join(", ")} immediately as they are out of stock.`,
      )
    }

    // Generate insights based on inventory data
    const totalValue = inventory.reduce((sum, item) => sum + item.price * item.quantity, 0)
    newInsights.push(`Total inventory value: $${totalValue.toFixed(2)}`)

    const categories = [...new Set(inventory.map((item) => item.category))]
    const categoryData = categories
      .map((category) => {
        const items = inventory.filter((item) => item.category === category)
        const value = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const count = items.length
        return { category, value, count }
      })
      .sort((a, b) => b.value - a.value)

    if (categoryData.length > 0) {
      const topCategory = categoryData[0]
      newInsights.push(`${topCategory.category} is your highest value category ($${topCategory.value.toFixed(2)})`)
    }

    // Add some predictive insights
    if (inventory.length > 0) {
      const randomItem = inventory[Math.floor(Math.random() * inventory.length)]
      newRecommendations.push(
        `Based on historical data, you should consider increasing stock of ${randomItem.name} by 15% for the upcoming season.`,
      )
    }

    if (inventory.length > 5) {
      const potentialDiscount = inventory.filter((item) => item.quantity > 20)
      if (potentialDiscount.length > 0) {
        newRecommendations.push(
          `Consider running a promotion for ${potentialDiscount[0].name} to optimize inventory levels.`,
        )
      }
    }

    setRecommendations(newRecommendations)
    setInsights(newInsights)
  }

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <Lightbulb className="h-6 w-6 text-indigo-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">AI Insights</h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-gray-600">Analyzing inventory data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <Lightbulb className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">AI Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <h4 className="font-medium text-gray-800">Recommendations</h4>
          </div>
          {recommendations.length > 0 ? (
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span className="text-sm text-gray-600">{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No recommendations at this time.</p>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            <h4 className="font-medium text-gray-800">Inventory Insights</h4>
          </div>
          {insights.length > 0 ? (
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-sm text-gray-600">{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No insights available.</p>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 italic">
        Note: These insights are generated using simulated AI analysis for demonstration purposes.
      </div>
    </div>
  )
}
