use lazy_static::lazy_static;
use mongodb::{bson::doc, options::ClientOptions, Client, Database};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use actix_web::HttpRequest;
use mongodb::bson::Document;
use mongodb::options::Collation;
use tokio::sync::OnceCell;
use crate::connect_sql::sql_handler::{DbError, LogInUser};
// #[derive(Debug, Serialize, Deserialize)]
// pub struct InventoryItemRequest {
//     pub item_name: String,
//     pub SKU: String,
//    // pub barcode: String,
//     //pub category: String,
//    // pub description: String,
//     pub quantity: i32,
//     // pub cost_price: i32,
//     // pub selling_price: i32,
//     // pub warehouse: String,
//     // pub shelf: String,
// }


#[derive(Debug, Serialize, Deserialize)]
pub struct InventoryItem {
    pub item_name: String,
    pub SKU: String,
   // pub barcode: String,
    pub category: String,
   // pub description: String,
    pub quantity: i32,
    pub price: f32,
    //pub location: Location,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Price {
    pub cost_price: i32,
    pub selling_price: i32,
}

#[derive(Debug, Serialize, Deserialize,)]
pub struct Location {
    pub warehouse: String,
    pub shelf: String,
}

lazy_static! {
   pub static ref MONGO_CLIENT: OnceCell<Arc<Client>> = OnceCell::new();
}

pub async fn get_mongo_client() -> Arc<Client> {
    MONGO_CLIENT
        .get_or_init(|| async {
            let uri = "mongodb://localhost:27017"; // MongoDB connection string
            let client_options = ClientOptions::parse(uri).await.unwrap();
            let client = Client::with_options(client_options).unwrap();
            println!("✅ MongoDB Client Initialized");
            Arc::new(client)
        })
        .await
        .clone()
}

pub async fn get_database(db_name:String) -> Database {
    let client = get_mongo_client().await;
    let db = client.database(&db_name);
    let collection = db.collection::<mongodb::bson::Document>("init_collection");
    let _ = collection
        .insert_one(doc! { "initialized": true }, None)
        .await
        .ok(); // Ignore error if it already exists

    db
}

pub async fn get_database_inventory(req: HttpRequest) -> Result<Database, Box<dyn std::error::Error>> {
    let client = get_mongo_client().await;

    let user_db = req.cookie("Data")
        .and_then(|cookie| serde_json::from_str::<LogInUser>(cookie.value()).ok());

    match user_db {
        Some(user) => {
            let db = client.database(&user.database_name);
            Ok(db)
        }
        None => Err("Missing or invalid user data cookie".into()),
    }
}
