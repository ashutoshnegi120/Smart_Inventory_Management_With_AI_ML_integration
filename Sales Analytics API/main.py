from typing import List
from fastapi import Cookie, FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import redis
from fastapi.middleware.cors import CORSMiddleware
import databases
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
load_dotenv()

app = FastAPI()

DB_USER = "postgres"
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DATABASE_URL_TEMPLATE = "postgresql://{user}:{password}@{host}:{port}/{db_name}"

client = AsyncIOMotorClient("mongodb://localhost:27017") 

class ProductSummary(BaseModel):
    product: str
    category: str
    units_sold: int
    revenue: float


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)


redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

@app.get("/getAll")
async def getCategories():
    data = redis_client.hgetall("product")
    return {"keys": list(data.keys())}

@app.get("/analytics_data/{db_name}")
async def analytics_data_from_sql(db_name: str):
    DATABASE_URL = DATABASE_URL_TEMPLATE.format(
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        db_name=db_name,
    )
    database = databases.Database(DATABASE_URL)
    await database.connect()
    
    query = """
        WITH exploded_sales AS (
            SELECT 
                sale_id,
                UNNEST(product_id) AS product,
                UNNEST(quantity_sold) AS quantity,
                UNNEST(price) AS unit_price,
                total_price,
                sale_date
            FROM sales
        ),
        revenue_cte AS (
            SELECT 
                SUM(quantity * unit_price * 1.05) AS total_revenue,
                SUM(quantity) AS items_sold
            FROM exploded_sales
        ),
        order_count_cte AS (
            SELECT COUNT(*) AS total_orders FROM sales
        )
        SELECT
            r.total_revenue,
            r.items_sold,
            ROUND((r.total_revenue / o.total_orders)::numeric, 2) AS avg_order_value
        FROM revenue_cte r, order_count_cte o;
    """

    result = await database.fetch_one(query)
    await database.disconnect()
    return {
        "total_revenue": result["total_revenue"],
        "items_sold": result["items_sold"],
        "avg_order_value": result["avg_order_value"]
    }
    
    


@app.get("/sales/product-summary/{db_name}")
async def product_summary(db_name: str):
    try:
        DATABASE_URL = DATABASE_URL_TEMPLATE.format(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            db_name=db_name,
        )
        database = databases.Database(DATABASE_URL)
        await database.connect()

        query ="""
                SELECT
                flat.product,
                flat.category,
                SUM(flat.quantity) AS units_sold,
                SUM(flat.quantity * flat.price) AS revenue
                FROM
                sales,
                LATERAL unnest(product_id, quantity_sold, price, categories)
                    AS flat(product, quantity, price, category)
                GROUP BY
                flat.product, flat.category
                ORDER BY
                revenue DESC
                """

        rows = await database.fetch_all(query)
        print("Fetched rows:", rows)

        await database.disconnect()

        result = [
            {
                "product": row["product"],
                "category": row["category"],
                "units_sold": row["units_sold"],
                "revenue": row["revenue"]
            }
            for row in rows
        ]
        return result

    except Exception as e:
        print("Error in product_summary:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})

    
    
@app.get("/daily-sales-summary/{db_name}")
async def last30day_sales_graph(db_name:str):
    DATABASE_URL = DATABASE_URL_TEMPLATE.format(
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        db_name=db_name,
    )
    database = databases.Database(DATABASE_URL)
    await database.connect()
    query = """
    SELECT
        TO_CHAR(DATE(sale_date), 'Mon DD') AS day_label,
        SUM(qty) AS sales,
        SUM(total_price) AS profit
    FROM
        sales,
        unnest(quantity_sold) AS qty
    WHERE
        sale_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY
        day_label
    ORDER BY
        MIN(sale_date);
    """

    results = await database.fetch_all(query)
    await database.disconnect()
    return [{"name": row["day_label"], "sales": row["sales"],  "profit": float(row["profit"])} for row in results]



@app.get("/low-stock-count/{db_name}")
async def low_stock_count(db_name:str):

    db = client[db_name]
    collection = db["inventory"]  # Use correct collection name like 'inventory'

    # Count items with quantity < 10
    count = await collection.count_documents({"quantity": {"$lt": 10}})

    return JSONResponse(content={"low_stock_count": count})



@app.get("/inventory/category-summary/{db_name}")
async def category_summary(db_name:str):
    db = client[db_name]
    inventory_collection = db["inventory"]
    pipeline = [
        {
            "$group": {
                "_id": "$category",
                "total_quantity": {"$sum": "$quantity"},
            }
        }
    ]
    cursor = inventory_collection.aggregate(pipeline)
    result = []
    async for doc in cursor:
        result.append({
            "category": doc["_id"],
            "total_quantity": doc["total_quantity"],
        })
    return result



@app.get("/")
async def read_root():
    return {"message": "Welcome to FastAPI with Redis"}
