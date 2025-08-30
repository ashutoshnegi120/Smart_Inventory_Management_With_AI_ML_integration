import re
from together import Together
import vector_database
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

client = Together() 

def clean_ai_response(text: str) -> str:
    return re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()

async def Inventory_Overview(context: str):
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        messages=[
            {
                "role": "system",
                "content": "You are an AI summarizer for inventory data."
            },
            {
                "role": "user",
                "content": (
                    f"Here is the inventory data:\n\n{context}\n\n"
                    "Summarize the inventory in JSON format with the following keys:\n"
                    "- Total Items\n"
                    "- Total Quantity\n"
                    "- Number of Categories\n"
                    "- Top 3 Categories by Quantity"
                )
            }
        ]
    )
    return clean_ai_response(response.choices[0].message.content)

async def Low_Stock_Report(context: str):
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        messages=[
            {
                "role": "system",
                "content": "You are a retail inventory assistant AI."
            },
            {
                "role": "user",
                "content": (
                    f"Given the inventory data:\n\n{context}\n\n"
                    "Identify items that are low on stock (less than 10 units).\n"
                    "Return a JSON with: Product, Category, Quantity."
                )
            }
        ]
    )
    return clean_ai_response(response.choices[0].message.content)

async def Reorder_Suggestion(context: str):
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        messages=[
            {
                "role": "system",
                "content": "You are an AI assistant helping with inventory restocking."
            },
            {
                "role": "user",
                "content": (
                    f"Inventory data:\n\n{context}\n\n"
                    "Based on the current stock, suggest items that need reordering (quantity < 10).\n"
                    "Output JSON with: Product, Current Quantity, Suggested Reorder Quantity (up to 50)."
                )
            }
        ]
    )
    return clean_ai_response(response.choices[0].message.content)

async def Performance_Analysis(context: str):
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        messages=[
            {
                "role": "system",
                "content": "You are an AI that provides sales performance insights."
            },
            {
                "role": "user",
                "content": (
                    f"Sales context:\n\n{context}\n\n"
                    "Generate a JSON showing:\n"
                    "- Best Performing Category\n"
                    "- Worst Performing Category\n"
                    "- Average Revenue per Category\n"
                    "- Total Revenue\n"
                )
            }
        ]
    )
    return clean_ai_response(response.choices[0].message.content)

async def Category_Breakdown(context: str):
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        messages=[
            {
                "role": "system",
                "content": "You are an AI that analyzes inventory distribution."
            },
            {
                "role": "user",
                "content": (
                    f"Here is the inventory data:\n\n{context}\n\n"
                    "Create a JSON showing each category with: Total Quantity, Item Count, and % of Inventory."
                )
            }
        ]
    )
    return clean_ai_response(response.choices[0].message.content)

async def Inventory_Value_Analysis(context: str):
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        messages=[
            {
                "role": "system",
                "content": "You are an AI assistant evaluating inventory value."
            },
            {
                "role": "user",
                "content": (
                    f"Given this inventory data:\n\n{context}\n\n"
                    "Calculate and return a JSON with:\n"
                    "- Total Inventory Value\n"
                    "- Highest Value Item\n"
                    "- Lowest Value Item\n"
                    "- Average Item Value\n"
                )
            }
        ]
    )
    return clean_ai_response(response.choices[0].message.content)



async def custom_chat(context: str, message: str):
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        messages=[
            {
                "role": "system",
                "content": "You are an AI assistant that analyzes and summarizes inventory data for business insights."
            },
            {
                "role": "user",
                "content": (
                    f"Given this inventory data:\n\n{context}\n\n"
                    f"{message}"
                )
            }
        ]
    )
    return clean_ai_response(response.choices[0].message.content)




async def genAI(db_name: str, action:str,msg: Optional[str]=None):
    try:
        print(f"[genAI] Fetching context for {db_name}")
        context = await vector_database.vector_chroma_put(db_name)
        if not context:
            return {"error": "No data found for the given database."}

        print(f"[genAI] Context sample: {context[:300]}")

        result = {}
        
        match action:
            case "inventory_overview":
                try:
                    print(f"[genAI] Calling Inventory_Overview")
                    result["inventory_overview"] = await Inventory_Overview(context)
                except Exception as e:
                    result["inventory_overview"] = f"Failed: {str(e)}"
                    print(f"[best_selling error]: {str(e)}")
            case "low_stock_report" :        
                try:
                    print(f"[genAI] Calling Low_Stock_Report")
                    result["low_stock_report"] = await Low_Stock_Report(context)
                except Exception as e:
                    result["low_stock_report"] = f"Failed: {str(e)}"
                    print(f"[best_selling error]: {str(e)}")
            case "reorder_suggestions":
                try:
                    print(f"[genAI] Calling Reorder_Suggestion")
                    result["reorder_suggestions"] = await Reorder_Suggestion(context)
                except Exception as e:
                    result["reorder_suggestions"] = f"Failed: {str(e)}"
                    print(f"[best_selling error]: {str(e)}")
            case "performance_analysis":
                try:
                    print(f"[genAI] Calling Performance_Analysis")
                    result["performance_analysis"] = await Performance_Analysis(context)
                except Exception as e:
                    result["performance_analysis"] = f"Failed: {str(e)}"
                    print(f"[best_selling error]: {str(e)}")
            case "category_breakdown":
                try:
                    print(f"[genAI] Calling Category_Breakdown")
                    result["category_breakdown"] = await Category_Breakdown(context)
                except Exception as e:
                    result["category_breakdown"] = f"Failed: {str(e)}"
                    print(f"[best_selling error]: {str(e)}")
            case "value_analysis":
                try:
                    print(f"[genAI] Calling Inventory_Value_Analysis")
                    result["value_analysis"] = await Inventory_Value_Analysis(context)
                except Exception as e:
                    result["value_analysis"] = f"Failed: {str(e)}"
                    print(f"[best_selling error]: {str(e)}")
            case "custom":
                try:
                    print(f"[genAI] Calling custom_chat")
                    result["custom"] = await custom_chat(context,message=msg)
                except Exception as e:
                    result["custom"] = f"Failed: {str(e)}"
                    print(f"[best_selling error]: {str(e)}")
        return result[action]
    except Exception as e:
        print(f"[genAI Error]: {str(e)}")
        raise RuntimeError(f"Error occurred: {str(e)}")
