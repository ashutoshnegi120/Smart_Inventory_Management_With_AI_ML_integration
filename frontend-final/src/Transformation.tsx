import { InventoryItem } from "./types/types";

export const mapApiResponseToInventoryItem = (apiData: any[]): InventoryItem[] => {
    return apiData.map(item => {
        const quantity = item.quantity;

        let status: InventoryItem["status"] = "In Stock";
        if (quantity === 0) {
            status = "Out of Stock";
        } else if (quantity < 10) {
            status = "Low Stock";
        }

        return {
            id: item._id.$oid,
            name: item.item_name,
            category: "Uncategorized", 
            sku: item.SKU,
            quantity: quantity,
            price: item.price,
            status: status,
            description: "", 
            image: undefined, 
        };
    });
};
