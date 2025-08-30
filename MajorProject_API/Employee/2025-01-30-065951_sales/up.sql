-- Your SQL goes here
CREATE  table sales(
    sale_id SERIAL PRIMARY KEY,
    product_id TEXT[] not null,
    quantity_sold INT[] not null ,
    price float[] not null,
    total_price float not null ,
    sold_by INT not null ,
    sale_date TIMESTAMP DEFAULT current_timestamp,
    categories TEXT[] not null
);