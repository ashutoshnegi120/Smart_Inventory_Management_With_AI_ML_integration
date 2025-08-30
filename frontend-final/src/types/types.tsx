
export interface InventoryItem {
    id: string
    name: string
    category: string
    sku: string
    quantity: number
    price: number
    status: "In Stock" | "Low Stock" | "Out of Stock"
    description: string
    image? : string
}
