-- Your SQL goes here
CREATE TABLE logs (
    log_id SERIAL PRIMARY KEY,
    activity VARCHAR(255) NOT NULL,
    performed_by INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);