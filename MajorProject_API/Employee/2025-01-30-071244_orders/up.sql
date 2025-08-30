CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    product_id TEXT[] NOT NULL,
    quantity_ordered INT[] NOT NULL,
    categories TEXT[] NOT NULL,
    price FLOAT4[] NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL
);
