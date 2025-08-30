import os
from dotenv import load_dotenv
from pymongo import MongoClient
import json

load_dotenv()

# === Environment Variables ===
POSTGRES_URL = os.getenv("POSTGRES_URL", "your_pg_url")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = "GenAI_vector_store"
MONGO_COLLECTION = "data"
client = MongoClient(MONGO_URL)
mongo_collection = client[MONGO_DB][MONGO_COLLECTION]

def load_vector_store(MONGO_COLLECTION):
    doc = mongo_collection.find_one({"_id":MONGO_COLLECTION})

    if not doc:
        initial_doc = {
            "_id": MONGO_COLLECTION,
            "vector_data": [],
            "last_updated_id": [0,0], #[sales,orders]
            "last_updated_time": None
        }
        mongo_collection.insert_one(initial_doc)
        return initial_doc

    return doc


async def save_vector_store(db_name,data):
    mongo_collection.replace_one({"_id": db_name}, data, upsert=True)
    
    
    
async def get_all(db_name):
    # Retrieve data from MongoDB
    data = mongo_collection.find_one({"_id": db_name})

    if data is None:
        print(f"No data found for db_name: {db_name}")
        return [], []  # Return empty lists if no data is found

    main_data = []
    ids = []

    # Ensure vector_data exists and is a list
    for i, vec in enumerate(data.get("vector_data", [])):
        original_data = vec.get("original_data", "")
        unique_id = f"{data['_id']}_{i}"  # Create a unique ID for each item
        ids.append(unique_id)

        if isinstance(original_data, str):
            try:
                # Attempt to parse stringified JSON if needed
                original_data = json.loads(original_data)
            except json.JSONDecodeError:
                print(f"Error decoding JSON in original_data for db_name: {db_name}")
                original_data = {}

        main_data.append({
            "type": vec.get("type", ""),
            "embedding": vec.get("embedding", ""),
            "original_data": original_data,
        })

    return main_data, ids 

    
    
