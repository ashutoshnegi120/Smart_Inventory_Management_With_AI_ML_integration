-- Your SQL goes here
CREATE TABLE employees (
                           employee_id SERIAL PRIMARY KEY,
                           name TEXT NOT NULL,
                           email TEXT NOT NULL UNIQUE,
                           password VARCHAR(255) NOT NULL,
                           permission TEXT NOT NULL,
                           first_time_password BOOLEAN NOT NULL,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
