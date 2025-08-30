import json
from sentence_transformers import SentenceTransformer
from datetime import datetime , UTC
import sql_connection
import mongodb_connection
from chromadb import Client
import asyncio

embedder = SentenceTransformer('all-MiniLM-L6-v2')

chroma_client = Client()

def embed_text(text):
    return embedder.encode(text).tolist()

async def update_vector_db(db_name):
    sql = sql_connection.DatabaseConfig(db_name=db_name)
    pg_sales_data = await sql_connection.fetch_sales_data(sql)
    pg_orders_data = await sql_connection.fetch_orders_data(sql)
    latest_pg_sales_id = pg_sales_data[0][0] if pg_sales_data else None
    latest_pg_orders_id = pg_orders_data[0][0] if pg_orders_data else None
    
    vector_doc = mongodb_connection.load_vector_store(db_name)
    last_mongo_id = vector_doc['last_updated_id']

    if latest_pg_sales_id == last_mongo_id[0]:
        print("✅ No new data. Vector DB sales data is up-to-date.")
    
    if latest_pg_orders_id == last_mongo_id[1]:
        print("✅ No new data. Vector DB sales data is up-to-date.")
        return

    new_vectors = []
    for row in pg_sales_data:
        _id, product_name, quantity,price,total_price,_,time,categories = row
        if last_mongo_id[0] == int(_id):
            break

        text = f"Product '{product_name}' from category '{categories}' sold {quantity} units on {time}."
        embedding = embed_text(text)
        new_vectors.append({
            "type": "sales",
            "embedding": embedding,
            "original_data": {
                "product_name": product_name,
                "quantity": quantity,
                "Time": time,
                "price" : price,
                "total_price" : total_price,
                "categories" : categories,
            },
        })
        
        
    for row in pg_orders_data:
        _id,_, product_name, quantity,categories,price,date,status = row
        if last_mongo_id[1]  == int(_id):
            break

        text = f"product {product_name}from category '{categories}' orders {quantity} units on {date} with status '{status}'"
        embedding = embed_text(text)
        new_vectors.append({
            "type": "orders",
            "embedding": embedding,
            "original_data": {
                "product_name": product_name,
                "quantity": quantity,
                "Date": date,
                "status":status,
                "categories": categories
            },
        })

    if new_vectors:
        print(f"🧠 Adding {len(new_vectors)} new records to vector store")

        updated_vector_data = new_vectors + (vector_doc["vector_data"] if vector_doc else [])
        await mongodb_connection.save_vector_store(db_name,{
            "_id": db_name,
            "vector_data": updated_vector_data,
            "last_updated_id": [int(latest_pg_sales_id),int(latest_pg_orders_id)],
            "last_updated_time": datetime.now(UTC).isoformat()
        })
    else:
        print("⚠️ No new vectors added — maybe IDs mismatch?")
        
        
def serialize_data(data):
    if isinstance(data, datetime):
        return data.isoformat()  # Convert datetime to ISO format string
    elif isinstance(data, list):
        return [serialize_data(item) for item in data]  # Recursively serialize list items
    elif isinstance(data, dict):
        return {key: serialize_data(value) for key, value in data.items()}  # Recursively serialize dict items
    return data  # Return the data as is if it's not a datetime, list, or dict

async def vector_chroma_put(db_name: str):
    # Get the MongoDB data
    data, ids = await mongodb_connection.get_all(db_name)

    if not data:
        print(f"No data found for db_name: {db_name}")
        return ""

    # Create or get Chroma collection
    chroma_collection = chroma_client.get_or_create_collection(name=db_name)

    # Extract documents and embeddings separately
    documents = []
    embeddings = []

    for item in data:
        original_data = item.get("original_data", "")
        
        # Handle if original_data is a dict
        if isinstance(original_data, dict):
            # Serialize original_data to a JSON-compatible format
            original_data = serialize_data(original_data)
            original_data = json.dumps(original_data)  # Now it's safe to convert to JSON

        documents.append(original_data)
        embeddings.append(item.get("embedding", []))  # Ensure embedding is a list

    # Add to Chroma
    chroma_collection.add(
        documents=documents,
        embeddings=embeddings,
        ids=ids
    )

    # Now query
    query = "What will be tomorrow's best-selling product?"
    query_embedding = embedder.encode(query)

    results = chroma_collection.query(
        query_embeddings=[query_embedding],
        n_results=5
    )

    # Prepare context
    context = "\n".join(doc for doc in results["documents"][0])

    # Optionally delete the collection if needed
    chroma_collection.delete(ids = ids) 

    return context

