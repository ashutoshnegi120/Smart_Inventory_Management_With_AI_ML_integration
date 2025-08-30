"use client"

import { Receipt, Printer, ArrowRight } from "lucide-react"
import { makeSales } from "../../api/post/Post"
import { useEffect } from "react"
import { useAuth } from "../../contexts/auth-context"

interface SaleCompleteModalProps {
    isOpen: boolean
    onClose: () => void
    receiptData: any
}

export default function SaleCompleteModal({ isOpen, onClose, receiptData }: SaleCompleteModalProps) {
    const { user } = useAuth()
    useEffect(() => {
        const sendSale = async () => {
            if (isOpen && receiptData && user != null) {
                const sale_by = Number(user.id) || 1;

                const products: Record<string, number> = {};
                const price: number[] = [];

                receiptData.items.forEach((item: any) => {
                    const name = item.category;
                    const quantity = Number(item.quantity) || 0;
                    const itemPrice = parseFloat(item.total?.toString() || "0");

                    if (name && quantity > 0) {
                        products[name] = quantity;
                    }

                    if (!isNaN(itemPrice)) {
                        price.push(itemPrice);
                    }
                });

                await makeSales(sale_by, products, price);
            }
        };

        sendSale();
    }, [receiptData, isOpen, user]);



    if (!isOpen || !receiptData) return null

    const handlePrint = () => {
        console.log("Printing receipt:", receiptData)
        alert("Receipt sent to printer")
    }

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
                    <div className="bg-green-50 px-4 py-3 sm:px-6 flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                            <Receipt className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="ml-3 text-lg leading-6 font-medium text-green-800">Sale Complete!</h3>
                    </div>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">Sale #{receiptData.id} has been completed successfully.</p>

                                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                                        <h4 className="font-medium text-gray-900 mb-2">Receipt Summary</h4>
                                        <div className="space-y-1 mb-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Date:</span>
                                                <span>{new Date(receiptData.date).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Payment Method:</span>
                                                <span className="capitalize">{receiptData.paymentMethod}</span>
                                            </div>
                                            {receiptData.customer.name && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Customer:</span>
                                                    <span>{receiptData.customer.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-gray-200 pt-3 mb-3">
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Items</h5>
                                            <div className="space-y-2">
                                                {receiptData.items.map((item: any, index: number) => (
                                                    <div key={index} className="flex justify-between text-sm">
                                                        <span>
                                                            {item.name} x {item.quantity}
                                                        </span>
                                                        <span>${item.total.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span>${receiptData.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Tax:</span>
                                                <span>${receiptData.tax.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-medium text-base mt-1">
                                                <span>Total:</span>
                                                <span>${receiptData.total.toFixed(2)}</span>
                                            </div>
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
                            onClick={onClose}
                        >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            New Sale
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={handlePrint}
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print Receipt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
