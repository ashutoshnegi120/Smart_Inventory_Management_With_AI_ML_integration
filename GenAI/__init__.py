import os
import subprocess
import sys
from dotenv import load_dotenv
import warnings
warnings.filterwarnings("ignore")

load_dotenv()




# 1. Install required packages if not already installed
REQUIRED_PACKAGES = [
    "fastapi",
    "uvicorn",
    "sqlalchemy",
    "requests",
    "chromadb",
    "together",
    "sentence-transformers",
    "pymongo",
    "asyncpg"
]

def install_packages():
    for package in REQUIRED_PACKAGES:
        try:
            __import__(package.split('==')[0])
        except ImportError:
            print(f"Installing missing package: {package}")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])

# 2. Check environment variables
REQUIRED_ENV_KEYS = [
    "TOGETHER_API_KEY",
    "DB_USER",
    "DB_PASSWORD",
    "DB_HOST",
    "DB_PORT",
]

def check_env_keys():
    missing = []
    for key in REQUIRED_ENV_KEYS:
        if not os.getenv(key):
            missing.append(key)
    return missing

# 3. Boot sequence
if __name__ == "__main__":
    print("🔧 Initializing environment...")

    install_packages()

    missing_keys = check_env_keys()
    if missing_keys:
        print(f"❌ Missing required environment keys: {', '.join(missing_keys)}")
        print("Please set them before running the app.")
        sys.exit(1)

    print("✅ Environment ready. Launching app...")
    try:
        subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "6969", "--reload"])
    except KeyboardInterrupt:
        print("\n process terminate!!")
    
    
