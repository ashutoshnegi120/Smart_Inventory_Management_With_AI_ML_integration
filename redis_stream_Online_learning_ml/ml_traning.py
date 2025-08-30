import time
import redis
import json
import os
import shutil
import pickle
from river import metrics
import matplotlib.pyplot as plt
import argparse

# Set up command-line argument parsing
parser = argparse.ArgumentParser()
parser.add_argument("--draw", action="store_true", help="Enable real-time plotting")
args = parser.parse_args()

if args.draw:
    plt.ion()  # Enable interactive mode only if --draw is passed
    fig, ax = plt.subplots()

mae_history = []

client = redis.Redis(host='127.0.0.1', port=6379, decode_responses=True)

def save_model(model, path):
    with open(path, "wb") as file:
        pickle.dump(model, file)

def get_product_index(product_name):
    index = client.hget("product", product_name)
    return index 

def check_ML_File(database_name: str):
    dir = "AI_models"
    os.makedirs(dir, exist_ok=True) 
    path = os.path.join(dir, database_name + "_AI_model.pkl")
    if not os.path.exists(path):
        if os.path.exists("river_model.pkl"): 
            shutil.copy2("river_model.pkl", path)
        else:
            raise FileNotFoundError("❌ Source model file 'river_model.pkl' does not exist.")
    return path

def ml_training(database_name: str, product: str, quantity: float):
    metric = metrics.MAE()
    model_path = check_ML_File(database_name)
    
    with open(model_path, "rb") as file:
        model = pickle.load(file) 
        
    lags = client.hget(database_name,product)
    lags = json.loads(lags)
    lag1=float(sum(lags["past"]["1"]))
    lag7=float(sum(lags["past"]["7"]))
    lag14= float(sum(lags["past"]["14"]))
    lag30= float(sum(lags["past"]["30"]))
    
    data = {
        "product": float(get_product_index(product)),
        "lag1":lag1,
        "lag7":lag7,
        "lag14":lag14,
        "lag30":lag30,
    }
    y_pred = model.forecast(horizon=1, xs=[data])  
    metric.update(float(quantity), y_pred[0])
    model.learn_one(data, float(quantity))
    mae_history.append(metric.get())
    save_model(model,model_path) 
    if args.draw:
        ax.clear()
        ax.plot(mae_history, label="MAE", color="red")
        ax.set_title("Live MAE Trend (Matplotlib)")
        ax.set_xlabel("Samples Processed")
        ax.set_ylabel("Mean Absolute Error")
        ax.grid(True)
        fig.canvas.draw()
        fig.canvas.flush_events()  # Force update
    
    print(f"Database: {database_name} | MAE: {metric.get():.4f}")
    save_model(model, model_path)

if not args.draw:
    plt.close()
        
        
    
