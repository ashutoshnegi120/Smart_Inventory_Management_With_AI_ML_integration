import multiprocessing
import time
from readdata import read_data
from redis import Redis
import argparse

# Argument parser for optional plotting (not used directly here)
parser = argparse.ArgumentParser()
parser.add_argument("--draw", action="store_true", help="Enable real-time plotting")
args = parser.parse_args()

# Redis client and stream setup
client = Redis(host='127.0.0.1', port=6379, decode_responses=True)
last_id = "0"  # Start from beginning of stream

def rust_to_python(stop_event):
    """Function that reads data from Redis when new data comes in."""
    global last_id
    from GenAI_result_cache import start_background_loop, start_run_periodic_safely, new_loop
    import threading

    # ✅ Ensure the periodic task is started only once
    if not hasattr(rust_to_python, "_scheduler_started"):
        rust_to_python._scheduler_started = True
        print("Starting GenAI periodic task in worker...")
        t = threading.Thread(target=start_background_loop, args=(new_loop,), daemon=True)
        t.start()
        start_run_periodic_safely()

    print("Worker process started. Waiting for new data...")

    while not stop_event.is_set():
        try:
            new_data = client.xread(streams={"mystream": last_id}, count=1, block=5000)
            if new_data:
                stream_name, messages = new_data[0]
                last_id = messages[-1][0]
                data = read_data()

                for product, quantity in data:
                    print(f"{product} : {quantity}")
        except Exception as e:
            print(f"Error in rust_to_python: {e}")
            break

    print("Worker process stopping...")

def keyboard_listener(stop_event):
    """Detects Ctrl+C and stops all processes."""
    try:
        while not stop_event.is_set():
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\nKeyboard Interrupt detected! Stopping processes...")
        stop_event.set()

if __name__ == "__main__":
    stop_event = multiprocessing.Event()

    worker = multiprocessing.Process(target=rust_to_python, args=(stop_event,))
    worker.start()

    listener = multiprocessing.Process(target=keyboard_listener, args=(stop_event,))
    listener.start()

    try:
        while not stop_event.is_set():
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\nMain Process: Keyboard Interrupt detected!")
        stop_event.set()

    worker.terminate()
    listener.terminate()
    worker.join()
    listener.join()

    print("All processes stopped. Exiting.")
