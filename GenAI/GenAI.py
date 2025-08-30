import re
from together import Together
import vector_database
from dotenv import load_dotenv

load_dotenv()

client = Together() 

async def best_selling(context):
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        messages=[
            {"role": "system", "content": "You are a helpful retail sales assistant."},
                {"role": "user", "content": f"Based on the following data:\n{context}\nWhat product is likely to be best-selling tomorrow? Answer in points, not too long."}
            ]
    )
    full_text = response.choices[0].message.content.strip()

    clean_text = re.sub(r'<think>.*?</think>', '', full_text, flags=re.DOTALL).strip()
    return clean_text

async def Top_Selling_Products(context):
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        messages=[
        {
            "role": "system",
            "content": (
                "You are a helpful retail sales assistant AI. "
                "Analyze the provided structured sales data and generate insightful summaries."
            )
        },
        {
            "role": "user",
            "content": (
                f"Based on the following data:\n\n{context}\n\n"
                "Give me a json listing the **Top Selling Products**.\n"
                "The json should contain the following columns:\n"
                "- Product\n"
                "- Category\n"
                "- Units Sold\n"
                "- Revenue\n"
                "- Trend (e.g., 8%↑ , 25%↓ )\n\n"
                "Only show the top 5 products ranked by total revenue."
            )
        }
    ]
    )
    full_text = response.choices[0].message.content.strip()

    clean_text = re.sub(r'<think>.*?</think>', '', full_text, flags=re.DOTALL).strip()
    return clean_text



async def genAI(db_name: str):
    try:
        print(f"[genAI] Fetching context for {db_name}")
        context = await vector_database.vector_chroma_put(db_name)
        if not context:
            return {"error": "No data found for the given database."}

        print(f"[genAI] Context sample: {context[:300]}")

        result = {}

        try:
            print(f"[genAI] Calling best_selling")
            result["best_selling"] = await best_selling(context)
        except Exception as e:
            result["best_selling"] = f"Failed: {str(e)}"
            print(f"[best_selling error]: {str(e)}")

        try:
            print(f"[genAI] Calling Top_Selling_Products")
            result["Top_Selling_Products"] = await Top_Selling_Products(context)
        except Exception as e:
            result["Top_Selling_Products"] = f"Failed: {str(e)}"
            print(f"[Top_Selling_Products error]: {str(e)}")

        return result

    except Exception as e:
        print(f"[genAI Error]: {str(e)}")
        raise RuntimeError(f"Error occurred: {str(e)}")
