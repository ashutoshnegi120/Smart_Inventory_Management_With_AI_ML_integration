# Use the official Rust image as the base
FROM rust:latest  AS builder

# Set working directory inside the container
WORKDIR /app

# Copy the Cargo files first (for caching dependencies)
COPY Cargo.toml Cargo.lock ./

# Copy the entire project, including migrations and .env
COPY . .

# Install Diesel CLI for database migrations
RUN cargo install diesel_cli --no-default-features --features postgres

# Build the Rust application
RUN cargo build --release

# -- Create a minimal runtime image --
FROM debian:bookworm-slim

# Set working directory inside the container
WORKDIR /app

# Install necessary dependencies (for Diesel CLI)
RUN apt-get update && apt-get install -y libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy the compiled binary from the builder
COPY --from=builder /app/target/release/inventory-api .
COPY --from=builder /usr/local/cargo/bin/diesel /usr/local/bin/diesel

# Copy the .env file into the container
COPY .env .env

# Run Diesel migrations & start the server
CMD ["sh", "-c", "diesel migration run && ./inventory-api"]

# Expose the application port
EXPOSE 8080
