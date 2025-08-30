import os
import asyncio
import aiohttp
import threading

lock = threading.Lock()
is_running = False  # Track if run_periodic is running

def get_all_db_from_ml_name() -> list:
    dir = "AI_models"
    ml_name_list = os.listdir(dir)
    return [name.removesuffix("_AI_model.pkl") for name in ml_name_list]

async def call_api(session, db_name):
    url = f"http://127.0.0.1:6969/genAI/{db_name}"
    print(f"url : {url}")
    try:
        async with session.put(url) as response:
            response.raise_for_status()
            data = await response.json()
            print(f"{db_name}: Success - {data}")
            return data
    except Exception as e:
        print(f"{db_name}: Failed - {e}")
        return None

async def main(db_names):
    async with aiohttp.ClientSession() as session:
        tasks = [call_api(session, db) for db in db_names]
        results = await asyncio.gather(*tasks)
    return results

async def run_periodic(interval_seconds=3600):
    global is_running
    with lock:
        if is_running:
            print("run_periodic is already running. Exiting.")
            return
        is_running = True

    print("Starting run_periodic...")
    try:
        while True:
            db_names = get_all_db_from_ml_name()
            await main(db_names)
            await asyncio.sleep(interval_seconds)
    finally:
        with lock:
            is_running = False
        print("run_periodic has finished.")

def start_background_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()

def start_run_periodic_safely():
    asyncio.run_coroutine_threadsafe(run_periodic(), new_loop)

# Export this event loop for external use
new_loop = asyncio.new_event_loop()
