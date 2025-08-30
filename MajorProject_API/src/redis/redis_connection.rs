use redis::{Client};
use actix_web::{web, HttpRequest};
use serde::{Serialize, Deserialize};
use serde_json;
use chrono::prelude::*;
use crate::connect_sql::sql_handler::LogInUser;
use actix_web::{Responder,Error};
use chrono::Local;
use redis::{AsyncCommands};

#[derive(Serialize, Deserialize)]
struct Data {
    database_name: String,
    product: String,
    quentity: i32,
    date: DateTime<Local>,
}


pub async fn send_data_to_ai(product : String , quentity : i32,req: HttpRequest) -> Result<impl Responder, Error> {
    let client = Client::open("redis://127.0.0.1/").map_err(actix_web::error::ErrorInternalServerError)?;

    let mut con = client.get_multiplexed_async_connection().await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let database_name = req.cookie("Data")
        .and_then(|cookie| serde_json::from_str::<LogInUser>(cookie.value()).ok());

    if let Some(user) = database_name {
        let send_data = Data {
            database_name: user.database_name.clone(),
            product,
            quentity,
            date: Local::now(),
        };

        let json_data = serde_json::to_string(&send_data)
            .map_err(actix_web::error::ErrorInternalServerError)?;

        // Use Redis stream with multiplexed connection
        con.xadd("mystream", "*", &[("data", json_data)])
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        Ok(web::Json("Data sent to Redis successfully"))
    } else {
        Err(actix_web::error::ErrorBadRequest("Missing or invalid user data cookie"))
    }
}