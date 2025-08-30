use crate::employee_schema::orders::{categories, order_id, status};
use actix_web::{web, HttpRequest, HttpResponse};
use actix_web::error::BlockingError;
use chrono::format::Item;
use chrono::Utc;
use diesel::{numeric_expr, RunQueryDsl};
use diesel::dsl::Order;
use log::error;
use serde_json::json;
use crate::employee_schema::orders::dsl::orders as Orders;
use crate::models::tools::{OrderField, OrderInSQL, OrdersRelatedResponse, OrdersRequest, StatusChange, Status, SaleRequest, SaleInSQL, SaleRelatedResponse, SaleField};
use crate::handlers::employee_handler::connect_db;
use diesel::prelude::*;
use diesel::QueryDsl;
use mongodb::{Collection, Cursor, Database};
use mongodb::bson::Bson::Document;
use mongodb::bson::doc;
use rand::{random, Rng};
use rand::distributions::Alphanumeric;
use crate::employee_schema::sales::dsl::sales;
use crate::connect_sql::no_sql::{InventoryItem,get_database_inventory};
use crate::employee_schema::employees::dsl::employees;
use crate::employee_schema::employees::{employee_id, permission};
use futures::stream::TryStreamExt;
use crate::redis::redis_connection::send_data_to_ai;

#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct InventoryData{
    _id: Option<mongodb::bson::oid::ObjectId>,
    item_name:String,
    SKU: String,
    category: String,
    quantity: i32,
    price: f64
}

pub fn generate_sku(prefix: Option<&str>) -> String {
    let timestamp = Utc::now().format("%Y%m%d%H%M%S").to_string();
    let random_string: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6) // Adjust length as needed
        .map(char::from)
        .collect();

    match prefix {
        Some(p) => format!("{}-{}-{}", p, timestamp, random_string),
        None => format!("{}-{}", timestamp, random_string),
    }
}
pub async fn handle_request(req: HttpRequest) -> Result<Database, HttpResponse> {
    match get_database_inventory(req).await {
        Ok(db) => Ok(db),
        Err(err) => Err(HttpResponse::InternalServerError().json(serde_json::json!({"error": err.to_string()}))),
    }
}
pub async fn get_item_quantity(collection: &Collection<InventoryItem>, product_name: &str, ) -> Result<Option<i32>, actix_web::Error> {
    let filter = doc! {"item_name": product_name};

    match collection.find_one(filter, None).await {
        Ok(Some(item)) => Ok(Some(item.quantity)),
        Ok(None) => Ok(None),
        Err(e) => {
            Err(actix_web::error::ErrorInternalServerError(format!(
                "Database error: {}", e
            )))
        }
    }
}
pub async fn set_orders(user_request : web::Json<OrdersRequest>, req : HttpRequest) -> HttpResponse {

    let mut conn = match connect_db(&req).await {
        Ok(conn) => {
            conn
        },
        Err(err) => {
            return err
        }
    };

    let mut product_ids  = Vec::new();
    let mut quantities  = Vec::new();

    for (product, quantity) in &user_request.products {
        product_ids.push(product.clone());
        quantities.push(*quantity);
    }

    let new_order = OrderInSQL{
        order_id:None,
        supplier_name : user_request.supplier_name.clone(),
        product_id: product_ids.clone(),
        quantity_ordered: quantities.clone(),
        categories : user_request.categories.clone(),
        price : user_request.price.clone(),
        order_date : Some(Utc::now().naive_utc()),
        status : Status::Pending.as_str().to_string(),
    };

    let insert_result = web::block(move || {
        diesel::insert_into(Orders)
            .values(&new_order)
            .execute(&mut conn)
    }).await;

    match insert_result {
        Ok(Ok(_)) => HttpResponse::Created().json(OrdersRelatedResponse {
            message: "Order stablest!!".to_string(),
        }),
        Ok(Err(e)) => {
            error!("server Error: {:?}", e);
            HttpResponse::InternalServerError().json("Failed to Order")
        }
        Err(e) => {
            error!("Thread pool error during database insert: {:?}", e);
            HttpResponse::InternalServerError().json("Database insert failed")
        }
    }

}

pub async fn display_orders(req: HttpRequest) -> HttpResponse {
    let mut conn = match connect_db(&req).await {
        Ok(conn) => conn,
        Err(err) => return err,
    };

    match Orders.load::<OrderField>(&mut conn) {
        Ok(order_list) => {

            match serde_json::to_string(&order_list) {
                Ok(_) => HttpResponse::Ok().json(json!({ "orders": order_list })),
                Err(e) => {
                    println!("❌ JSON serialization failed: {:?}", e);
                    HttpResponse::InternalServerError().json(json!({ "error": format!("Serialization error: {}", e) }))
                }
            }
        }
        Err(e) => {
            println!("❌ Diesel query failed: {:?}", e);
            HttpResponse::InternalServerError().json(json!({ "error": "Error retrieving orders" }))
        }
    }
}

pub async fn status_change(user_request: web::Json<StatusChange>, req: HttpRequest) -> HttpResponse {
    let mut conn = match connect_db(&req).await {
        Ok(conn) => conn,
        Err(err) => return err,
    };

    if user_request.status == "delivered" {
        let result = web::block({
            move || {
                Orders
                    .filter(order_id.eq(user_request.id))
                    .first::<OrderField>(&mut conn)
                    .optional()
                    .map_err(|e| e.to_string())
            }
        }).await;
        let db_holder = match handle_request(req).await {
            Ok(db) => db,
            Err(err) => return err,
        };
        let collection: Collection<InventoryItem> = db_holder.collection("inventory");

        return match result {
            Ok(inner_result) => match inner_result {
                Ok(Some(order)) => {
                    for (product_name, product_quantity, product_price, product_category) in order
                        .product_id
                        .iter()
                        .zip(order.quantity_ordered.iter())
                        .zip(order.price.iter())
                        .zip(order.categories.iter())
                        .map(|(((a, b), c), d)| (a, b, c, d))
                    {
                        match get_item_quantity(&collection, product_name).await {
                            Ok(Some(existing_quantity)) => {
                                let new_quantity = existing_quantity + product_quantity;

                                let existing_doc = collection
                                    .find_one(doc! {"item_name": product_name}, None)
                                    .await
                                    .unwrap_or(None);

                                if let Some(item) = existing_doc {
                                    let current_price = item.price as f64;
                                    let profit_percent = rand::thread_rng().gen_range(3.0..10.0);
                                    let new_price = current_price * (1.0 + profit_percent / 100.0);

                                    if let Err(e) = collection
                                        .update_one(
                                            doc! { "item_name": product_name },
                                            doc! {
                                                        "$set": {
                                                            "quantity": new_quantity,
                                                            "price": new_price
                                                        }
                                                    },
                                            None,
                                        )
                                        .await
                                    {
                                        return HttpResponse::InternalServerError()
                                            .json(json!({ "error": e.to_string() }));
                                    }
                                }
                            }

                            Ok(None) => {
                                let new_item = InventoryItem {
                                    item_name: product_name.to_string(),
                                    SKU: generate_sku(Some(product_name)),
                                    quantity: *product_quantity,
                                    price: *product_price,
                                    category: product_category.to_string(),
                                };

                                if let Err(e) = collection.insert_one(new_item, None).await {
                                    return HttpResponse::InternalServerError()
                                        .json(json!({ "error": e.to_string() }));
                                }
                            }

                            Err(e) => {
                                return HttpResponse::InternalServerError()
                                    .json(json!({ "error": e.to_string() }));
                            }
                        }
                    }

                    HttpResponse::Ok().json("Order status updated and inventory adjusted.")
                }

                Ok(None) => {
                    HttpResponse::NotFound().json("Order not found")
                }

                Err(err_msg) => {
                    HttpResponse::InternalServerError().json(err_msg)
                }
            },

            Err(blocking_err) => {
                HttpResponse::InternalServerError()
                    .json(format!("Blocking error: {}", blocking_err))
            }
        }
    }

    // Update order status if not "Delivered"
    let update_result = web::block({
        move || {
            diesel::update(Orders.filter(order_id.eq(user_request.id)))
                .set(status.eq(user_request.status.clone()))
                .execute(&mut conn)
        }
    }).await;

    match update_result {
        Ok(rows_affected) => {
            if rows_affected == Ok(0) {
                HttpResponse::NotFound().json("Order not found")
            } else {
                HttpResponse::Ok().json("Order status updated successfully")
            }
        }
        Err(_) => HttpResponse::InternalServerError().json("Failed to update order status"),
    }
}

pub async fn set_sales(user_request: web::Json<SaleRequest>, req: HttpRequest) -> HttpResponse {
    // Connect to PostgreSQL
    let mut conn = match connect_db(&req).await {
        Ok(conn) => conn,
        Err(err) => return err,
    };

    // Collect product IDs and quantities
    let mut product_ids = Vec::new();
    let mut quantities = Vec::new();

    for (product, quantity) in &user_request.products {
        product_ids.push(product.clone());
        quantities.push(*quantity);
    }

    // Prepare the SaleInSQL struct
    let new_sale = SaleInSQL {
        sale_id: None,
        product_id: product_ids.clone(),
        quantity_sold: quantities.clone(),
        price: user_request.price.clone(),
        total_price: user_request.price.iter().sum::<f64>(),
        sold_by: user_request.sale_by.clone(),
        sale_date: Some(Utc::now().naive_utc()),
        categories: user_request.categories.clone(),
    };

    // Insert sale into PostgreSQL
    let insert_result = web::block(move || {
        diesel::insert_into(sales)
            .values(&new_sale)
            .execute(&mut conn)
    }).await;

    // Now handle MongoDB inventory logic
    let db_holder = match handle_request(req.clone()).await {
        Ok(db) => db,
        Err(_) => return HttpResponse::InternalServerError().body("Inventory DB connection failed"),
    };
    let collection: Collection<InventoryItem> = db_holder.collection("inventory");

    for ((product_name, sold_quantity), category) in product_ids.iter().zip(quantities.iter()).zip(user_request.categories.iter()) {
        let filter = doc! { "item_name": product_name };
        match collection.find_one(filter.clone(), None).await {
            Ok(Some(existing_item)) => {
                // Calculate new quantity
                let new_quantity = (existing_item.quantity - sold_quantity).max(0);

                // Update MongoDB document
                if let Err(e) = collection
                    .update_one(filter, doc! { "$set": { "quantity": new_quantity } }, None)
                    .await
                {
                    error!("MongoDB update error: {}", e);
                }
            }
            Ok(None) => {
                error!("Product `{}` not found in inventory", product_name);
                // You can also return 404 or just continue like here
            }
            Err(e) => {
                error!("MongoDB read error: {}", e);
                return HttpResponse::InternalServerError()
                    .json(serde_json::json!({ "error": "MongoDB inventory fetch error" }));
            }
        }

        // Optional: notify AI after inventory change
        if let Err(err) = send_data_to_ai(category.parse().unwrap_or_default(), *sold_quantity, req.clone()).await {
            println!("AI sync failed: {}", err);
        }
    }

    // Final response
    match insert_result {
        Ok(Ok(_)) => HttpResponse::Created().json(SaleRelatedResponse {
            message: "Order established and inventory updated!".to_string(),
        }),
        Ok(Err(e)) => {
            error!("PostgreSQL insert error: {:?}", e);
            HttpResponse::InternalServerError().json("Failed to record sale")
        }
        Err(e) => {
            error!("Thread pool error during database insert: {:?}", e);
            HttpResponse::InternalServerError().json("Database insert failed")
        }
    }
}


pub async fn show_all_sales(req : HttpRequest) -> HttpResponse {
    let mut conn = match connect_db(&req).await {
        Ok(conn) => conn,
        Err(err) => return err,
    };

    match sales.load::<SaleField>(&mut conn) {
        Ok(Sale_list) => HttpResponse::Ok().json(json!({"orders": Sale_list})),
        Err(_) => HttpResponse::InternalServerError().json("Error retrieving orders"),
    }
}

pub async fn get_inventory(req: HttpRequest) -> HttpResponse {
    let db_holder = match handle_request(req).await {
        Ok(db) => db,
        Err(_) => return HttpResponse::InternalServerError().body("Database connection failed"),
    };

    let collection: Collection<InventoryData> = db_holder.collection("inventory");

    let cursor = match collection.find(None, None).await {
        Ok(cursor) => cursor,
        Err(_) => return HttpResponse::InternalServerError().body("Failed to fetch inventory"),
    };

    let inventory: Result<Vec<InventoryData>, mongodb::error::Error> = cursor.try_collect().await;

    match inventory {
        Ok(items) => HttpResponse::Ok().json(items),
        Err(_) => HttpResponse::InternalServerError().body("Error processing inventory data"),
    }
}

