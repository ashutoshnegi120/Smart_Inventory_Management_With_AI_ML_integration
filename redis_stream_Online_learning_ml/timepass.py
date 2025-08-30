import redis

# Connect to Redis
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Read products from a text file
file_path = "electronic_products.txt"  # Change to your actual file path

with open(file_path, "r", encoding="utf-8") as file:
    products = [line.strip() for line in file if line.strip()]

# Store products in Redis as a Hash (HSET)
for index, product in enumerate(products, start=1):
    redis_client.hset("product", product.lower(), index)

print("Products stored in Redis successfully!")

# Function to get index by product name
def get_product_index(product_name):
    index = redis_client.hget("product", product_name)
    return index if index else "Product not found!"

# Example usage
product_name = "laptops"  # Change to test different products
print(f"Index of '{product_name}': {get_product_index(product_name)}")
