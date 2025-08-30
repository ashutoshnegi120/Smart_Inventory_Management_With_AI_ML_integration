use diesel::pg::PgConnection;
use diesel::r2d2::{self, ConnectionManager, Pool};
use actix_web::HttpRequest;
use dotenv::dotenv;
use std::env;
use std::fmt::format;
use std::sync::Arc;
use serde::{Serialize, Deserialize};
use once_cell::sync::Lazy;
use dashmap::DashMap;
use crate::schema::users::database_name;

#[derive(Debug, Serialize, Deserialize)]
pub struct LogInUser {
    pub database_name: String,
}
#[derive(Debug)]
pub enum DbError {
    ConnectionPoolError(String),
    CookieParseError(String),
    EnvVarError()
}

pub type DbPool = Pool<ConnectionManager<PgConnection>>;

static DB_POOLS: Lazy<DashMap<String, Arc<DbPool>>> = Lazy::new(DashMap::new);

/// Establish a connection to the main database
pub fn establish_connection() -> Result<DbPool, String> {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").map_err(|_| "DATABASE_URL must be set".to_string())?;
    let manager = ConnectionManager::<PgConnection>::new(database_url);

    Pool::builder()
        .build(manager)
        .map_err(|_| "Failed to create connection pool".to_string())
}


pub fn establish_connection_to_user_db(req: &HttpRequest) -> Result<Arc<DbPool>, DbError> {
    // Load environment variables
    dotenv::dotenv().ok();
    // Get base URL for admin databases
    let base_url = env::var("DATABASE_URL_ADMIN").map_err(|_| DbError::EnvVarError())?;

    // Extract database name from the "Data" cookie
    let user_db = req.cookie("Data")
        .and_then(|cookie| serde_json::from_str::<LogInUser>(cookie.value()).ok())
        .map(|user| format!("{}{}", base_url, user.database_name))
        .ok_or_else(|| DbError::CookieParseError("Failed to retrieve user database from cookie".to_string()))?;
    // Check if the connection pool already exists
    if let Some(pool) = DB_POOLS.get(&user_db) {
        return Ok(pool.clone()); // Clone the Arc here
    }

    // Create a new connection pool if not found in cache
    let manager = ConnectionManager::<PgConnection>::new(user_db.clone());
    let pool = Pool::builder()
        .build(manager)
        .map_err(|_| DbError::ConnectionPoolError("Failed to create connection pool".to_string()))?;
    // Store the new connection pool in the cache
    let pool_arc = Arc::new(pool);
    DB_POOLS.insert(user_db, pool_arc.clone());
    Ok(pool_arc)
}

pub fn establish_connection_to_user_db_without_cookies(database:String) -> Result<Arc<DbPool>, DbError> {
    // Load environment variables
    dotenv::dotenv().ok();
    // Get base URL for admin databases
    let base_url = env::var("DATABASE_URL_ADMIN").map_err(|_| DbError::EnvVarError())?;

    // Extract database name from the "Data" cookie
    let user_db = format!("{}{}",base_url,database);
    // Check if the connection pool already exists
    if let Some(pool) = DB_POOLS.get(&user_db) {
        return Ok(pool.clone()); // Clone the Arc here
    }

    // Create a new connection pool if not found in cache
    let manager = ConnectionManager::<PgConnection>::new(user_db.clone());
    let pool = Pool::builder()
        .build(manager)
        .map_err(|_| DbError::ConnectionPoolError("Failed to create connection pool".to_string()))?;
    // Store the new connection pool in the cache
    let pool_arc = Arc::new(pool);
    DB_POOLS.insert(user_db, pool_arc.clone());
    Ok(pool_arc)
}

