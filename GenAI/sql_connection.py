import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseConfig:
    def __init__(self, db_name: str):
        self.db_name = db_name
        self.db_user = os.getenv("DB_USER")
        self.db_password = os.getenv("DB_PASSWORD")
        self.db_host = os.getenv("DB_HOST")
        self.db_port = os.getenv("DB_PORT")

    async def get_connection(self):
        try:
            conn = await asyncpg.connect(
                database=self.db_name,
                user=self.db_user,
                password=self.db_password,
                host=self.db_host,
                port=self.db_port,
            )
            print(f"✅ Connected to PostgreSQL DB: {self.db_name}")
            return conn
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return None


async def fetch_sales_data(db_config: DatabaseConfig):
    conn = await db_config.get_connection()
    if not conn:
        return []

    try:
        rows = await conn.fetch("SELECT * FROM sales ORDER BY sale_id DESC;")
        return rows
    finally:
        await conn.close()


async def fetch_orders_data(db_config: DatabaseConfig):
    conn = await db_config.get_connection()
    if not conn:
        return []

    try:
        rows = await conn.fetch("SELECT * FROM orders ORDER BY order_id DESC;")
        return rows
    finally:
        await conn.close()


# Optional test
if __name__ == "__main__":
    import asyncio
    db_name = input("Enter your PostgreSQL database name: ")
    db = DatabaseConfig(db_name=db_name)

    async def main():
        sales = await fetch_sales_data(db)
        orders = await fetch_orders_data(db)

        print("📦 Sales:", sales)
        print("📦 Orders:", orders)

    asyncio.run(main())
