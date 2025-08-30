use diesel::{deserialize, Insertable, Queryable};
use crate::employee_schema::orders as table_orders;
use crate::employee_schema::sales;
use std::collections::HashMap;
use std::str::FromStr;
use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use crate::employee_schema::sales::price;

#[derive(Debug)]
pub enum Status {
    Pending,
    Shipped,
    Delivered,
    Cancelled,
}

impl Status {
    pub(crate) fn as_str(&self) -> &'static str {
        match self {
            Status::Pending => "pending",
            Status::Shipped => "shipped",
            Status::Delivered => "delivered",
            Status::Cancelled => "cancelled",
        }
    }
}

#[derive(Deserialize)]
pub struct OrdersRequest {
    pub supplier_name: String,
    pub categories : Vec<String>,
    pub price : Vec<f32>,
    pub products: HashMap<String, i32>,

}

#[derive(Serialize)]
pub struct OrdersRelatedResponse {
    pub message:String,
}

#[derive(Deserialize)]
pub struct StatusChange{
    pub id : i32,
    pub status : String,
}

#[derive(Queryable, Insertable, Serialize, Deserialize)]
#[diesel(table_name = table_orders)]
pub struct OrderInSQL {
    pub order_id: Option<i32>,
    pub supplier_name: String,
    pub product_id: Vec<String>,
    pub categories: Vec<String>,
    pub quantity_ordered: Vec<i32>,
    pub price : Vec<f32>,
    pub order_date: Option<NaiveDateTime>,
    pub status: String,
}

#[derive(Queryable, Insertable, Serialize, Deserialize, Debug)]
#[diesel(table_name = table_orders)]
pub struct OrderField {
    pub order_id: i32,
    pub supplier_name: String,
    pub product_id: Vec<String>,
    pub categories: Vec<String>,
    pub quantity_ordered: Vec<i32>,
    pub price : Vec<f32>,
    pub order_date: Option<NaiveDateTime>,
    pub status: String,
}



/*
sale_id -> Int4,
        product_id -> Array<Text>,
        quantity_sold -> Array<Int4>,
        price -> Array<Float8>,
        total_price -> Float8,
        sold_by -> Int4,
        sale_date -> Nullable<Timestamp>,
*/

#[derive(Deserialize)]
pub struct SaleRequest {
    pub sale_by : i32,
    pub products: HashMap<String,i32>,
    pub categories: Vec<String>,
    pub price: Vec<f64>,
}

#[derive(Serialize)]
pub struct SaleRelatedResponse {
    pub message:String,
}
#[derive(Queryable, Insertable, Serialize, Deserialize)]
#[diesel(table_name = sales)]
pub struct SaleInSQL {
    pub sale_id: Option<i32>,
    pub product_id: Vec<String>,
    pub quantity_sold: Vec<i32>,
    pub price : Vec<f64>,
    pub total_price : f64,
    pub sold_by : i32,
    pub sale_date: Option<NaiveDateTime>,
    pub categories: Vec<String>,
}

#[derive(Queryable, Insertable, Serialize, Deserialize)]
#[diesel(table_name = sales)]
pub struct SaleField {
    pub sale_id: i32,
    pub product_id: Vec<String>,
    pub quantity_sold: Vec<i32>,
    pub price: Vec<f64>,
    pub total_price: f64,
    pub sold_by: i32,
    pub sale_date: Option<NaiveDateTime>,
    pub categories: Vec<String>,
}


