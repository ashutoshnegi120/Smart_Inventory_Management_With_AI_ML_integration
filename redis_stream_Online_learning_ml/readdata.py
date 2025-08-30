from redis import *
import json
from pymongo import MongoClient
from lag_mantanes import update_lag_for_category
from ml_traning import ml_training

client = Redis(host='127.0.0.1', port=6379, decode_responses=True)

mongoclient = MongoClient("mongodb://127.0.0.1:27017")
DB = mongoclient["AI_MODEL"]

def read_data():
    store_data = client.xrange("mystream", "-", "+")  
    processed_data = []

    for id, redis_data in store_data:
        print("📌 ID:", id)
        print("🔹 Key\t:\tValue")

        for _, json_string in redis_data.items():
            parsed_data = json.loads(json_string)
            

            structured_data = {
                "product": parsed_data.get("product", "Unknown"),
                "quantity": parsed_data.get("quentity", 0), 
                "date": parsed_data.get("date", "Unknown"),
            }
            

            db_name = parsed_data.get("database_name", "Unknown")
            if db_name != "Unknown":
                DB[db_name].insert_one(structured_data)  
            
            processed_data.append((parsed_data.get("product", "unknown"), parsed_data.get("quentity", 0)))
            update_lag_for_category(database_name=db_name,category_name=structured_data.get("product"),value=structured_data.get("quantity"))
            ml_training(database_name=db_name,product=structured_data.get("product"),quantity=float(structured_data.get("quantity")))
        client.xdel("mystream", id) 

    return processed_data  

