import redis
import json
import schedule


client = redis.Redis(host='127.0.0.1', port=6379, decode_responses=True)


LAG_PERIODS = [1, 7, 14, 30]


def initialize_category_lag():
    return {
        "past": {str(days): [] for days in LAG_PERIODS}, 
        "current": {"1": 0} 
    }


def maintain_queue(arr, max_size, new_value):
    if len(arr) >= max_size:
        arr.pop()  
    arr.insert(0, new_value)  

def update_lags():
    print("⏳ Updating lags at 8 PM...")

    all_databases = client.keys("*")

    for db_name in all_databases:
        key_type = client.type(db_name)

        if key_type == "hash" and db_name != "product":  
            print(f"✅ Processing {db_name} (Type: {key_type})")
        else:
            print(f"⚠️ Skipping {db_name} (Type: {key_type})")
            continue 

        db_data = client.hgetall(db_name)
        if not db_data:
            continue 

        
        updated_data = {}
        for category, category_data in db_data.items():
            try:
                category_lags = json.loads(category_data)
            except json.JSONDecodeError:
                print(f"❌ Error: Failed to decode JSON for category '{category}' in {db_name}")
                continue 

            for day in map(str, LAG_PERIODS):
                maintain_queue(category_lags["past"][day], int(day), category_lags["current"]["1"])

            category_lags["current"]["1"] = 0  

            updated_data[category] = json.dumps(category_lags)

    
        client.hset(db_name, mapping=updated_data)
        print(f"✅ Updated lags for database: {db_name}")  


def update_lag_for_category(database_name, category_name, value):
    db_data = client.hget(database_name, category_name)
    if not db_data:
        category_lags = initialize_category_lag()
    else:
        category_lags = json.loads(db_data)
        
    category_lags["current"]["1"] += value  


    client.hset(database_name, category_name, json.dumps(category_lags))
    print(f"📌 Updated current-day lag for `{category_name}` in `{database_name}` by `{value}`.")

schedule.every().day.at("20:00").do(update_lags)

