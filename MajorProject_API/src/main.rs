mod handlers;
mod models;
mod routes;
mod connect_sql;
mod schema;
mod employee_schema;
mod redis;
mod Request_microservice;

use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use dotenv::dotenv;
use std::env;
use routes::user_routes::init;
use connect_sql::sql_handler::{establish_connection};
use env_logger;



#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    dotenv().ok();

    // Get host and port from environment variables or use defaults
    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "8090".to_string());

    // Print the server URL for debugging
    println!(
        "🚀 Server is running at http://{}:{}",
        host, port
    );

    let pool = match establish_connection() {
        Ok(pool) => pool,
        Err(err) => {
            eprintln!("Failed to create DB pool: {}", err);
            return std::process::exit(1);
        }
    };


    HttpServer::new(move || {
        App::new()
            .wrap(
                Cors::default()
                    .allowed_origin("http://localhost:5173")
                    .allowed_methods(vec!["GET", "POST","PATCH"])
                    .allowed_headers(vec![http::header::CONTENT_TYPE])
                    .supports_credentials() // ✅
            )
            .app_data(web::Data::new(pool.clone())) // Share DbPool with handlers
            .configure(init) // Load your routes
    })
        .bind(format!("{}:{}", host, port))?
        .run()
        .await
}
