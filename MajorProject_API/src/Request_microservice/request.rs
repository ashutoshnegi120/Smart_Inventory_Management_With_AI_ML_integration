use actix_web::{web, HttpRequest, HttpResponse, Responder};
use crate::connect_sql::sql_handler::{DbError, LogInUser};
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug,Serialize)]
struct ApiResponse {
    database_name: String,
}

#[derive(Debug, Deserialize,Serialize)]
struct AnalyticsData {
    total_revenue: f64,
    items_sold: i32,
    avg_order_value: f64,
}

#[derive(Deserialize, Debug,Serialize)]
struct LowStockCount {
    low_stock_count: i64, // or i32 if you're sure about size
}
#[derive(Serialize, Deserialize, Debug)]
struct DailySalesSummary {
    name: String,       // e.g. "May 01"
    sales: i32,         // quantity sold
    profit: f64,        // total profit/revenue
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CategorySummary {
    pub category: String,
    pub total_quantity: i32,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct ProductSummary {
    pub product: String,
    pub category: String,
    pub units_sold: i32,
    pub revenue: f64,
}

#[derive(Deserialize, Serialize, Debug)]
struct genAI {
    answer: String,
    request_id: Option<String>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct genAI_request{
    pub action : String,
    pub message : Option<String>,
}

pub async fn analytics_data(req: HttpRequest) -> impl Responder {
    let user_db = match req.cookie("Data")
        .and_then(|cookie| serde_json::from_str::<LogInUser>(cookie.value()).ok())
    {
        Some(user) => user.database_name,
        None => {
            return HttpResponse::BadRequest().json(
                serde_json::json!({"error": "Failed to retrieve user database from cookie"}),
            );
        }
    };

    // Create HTTP client
    let client = Client::new();

    // Build request URL with query param if needed or use POST with body if needed
    let url = format!("http://127.0.0.1:8000/analytics_data/{}", user_db);
    println!("analytics_data: {}", url);

    // Send GET request to FastAPI
    let resp_result = client.get(&url).send().await;

    let resp = match resp_result {
        Ok(res) => res,
        Err(err) => {
            return HttpResponse::InternalServerError().json(
                serde_json::json!({"error": format!("Failed to contact FastAPI: {}", err)}),
            );
        }
    };

    // Parse JSON response from FastAPI
    let api_response = resp.json::<AnalyticsData>().await;

    match api_response {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(err) => HttpResponse::InternalServerError().json(
            serde_json::json!({"error": format!("Failed to parse FastAPI response: {}", err)}),
        ),
    }
}



pub async fn low_stock_count(req: HttpRequest) -> impl Responder {
    let user_db = match req.cookie("Data")
        .and_then(|cookie| serde_json::from_str::<LogInUser>(cookie.value()).ok())
    {
        Some(user) => user.database_name,
        None => {
            return HttpResponse::BadRequest().json(
                serde_json::json!({"error": "Failed to retrieve user database from cookie"}),
            );
        }
    };

    // Create HTTP client
    let client = Client::new();

    // Build request URL with query param if needed or use POST with body if needed
    let url = format!("http://127.0.0.1:8000/low-stock-count/{}", user_db);
    println!("low_stock_count: {}", url);

    // Send GET request to FastAPI
    let resp_result = client.get(&url).send().await;

    let resp = match resp_result {
        Ok(res) => res,
        Err(err) => {
            return HttpResponse::InternalServerError().json(
                serde_json::json!({"error": format!("Failed to contact FastAPI: {}", err)}),
            );
        }
    };

    // Parse JSON response from FastAPI
    let api_response = resp.json::<LowStockCount>().await;

    match api_response {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(err) => HttpResponse::InternalServerError().json(
            serde_json::json!({"error": format!("Failed to parse FastAPI response: {}", err)}),
        ),
    }
}

pub async fn daily_sales_summary(req: HttpRequest) -> impl Responder {
    let user_db = match req.cookie("Data")
        .and_then(|cookie| serde_json::from_str::<LogInUser>(cookie.value()).ok())
    {
        Some(user) => user.database_name,
        None => {
            return HttpResponse::BadRequest().json(
                serde_json::json!({"error": "Failed to retrieve user database from cookie"}),
            );
        }
    };

    // Create HTTP client
    let client = Client::new();

    // Build request URL with query param if needed or use POST with body if needed
    let url = format!("http://127.0.0.1:8000/daily-sales-summary/{}", user_db);
    println!("daily_sales_summary: {}", url);

    // Send GET request to FastAPI
    let resp_result = client.get(&url).send().await;

    let resp = match resp_result {
        Ok(res) => res,
        Err(err) => {
            return HttpResponse::InternalServerError().json(
                serde_json::json!({"error": format!("Failed to contact FastAPI: {}", err)}),
            );
        }
    };

    // Parse JSON response from FastAPI
    let api_response = resp.json::<Vec<DailySalesSummary>>().await;

    match api_response {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(err) => HttpResponse::InternalServerError().json(
            serde_json::json!({"error": format!("Failed to parse FastAPI response: {}", err)}),
        ),
    }
}


pub async fn category_summary(req: HttpRequest) -> impl Responder {
    let user_db = match req.cookie("Data")
        .and_then(|cookie| serde_json::from_str::<LogInUser>(cookie.value()).ok())
    {
        Some(user) => user.database_name,
        None => {
            return HttpResponse::BadRequest().json(
                serde_json::json!({"error": "Failed to retrieve user database from cookie"}),
            );
        }
    };

    // Create HTTP client
    let client = Client::new();

    // Build request URL with query param if needed or use POST with body if needed
    let url = format!("http://127.0.0.1:8000/inventory/category-summary/{}",user_db);
    println!("category_summary: {}", url);

    // Send GET request to FastAPI
    let resp_result = client.get(&url).send().await;

    let resp = match resp_result {
        Ok(res) => res,
        Err(err) => {
            return HttpResponse::InternalServerError().json(
                serde_json::json!({"error": format!("Failed to contact FastAPI: {}", err)}),
            );
        }
    };

    // Parse JSON response from FastAPI
    let api_response = resp.json::<Vec<CategorySummary>>().await;

    match api_response {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(err) => HttpResponse::InternalServerError().json(
            serde_json::json!({"error": format!("Failed to parse FastAPI response: {}", err)}),
        ),
    }
}

pub async fn product_summary(req: HttpRequest) -> impl Responder {
    let user_db = match req.cookie("Data")
        .and_then(|cookie| serde_json::from_str::<LogInUser>(cookie.value()).ok())
    {
        Some(user) => user.database_name,
        None => {
            return HttpResponse::BadRequest().json(
                serde_json::json!({"error": "Failed to retrieve user database from cookie"}),
            );
        }
    };

    let url = format!("http://127.0.0.1:8000/sales/product-summary/{}", user_db);
    println!("ProductSummary URL: {}", url);

    let client = Client::new();
    let resp_result = client.get(&url).send().await;

    let resp = match resp_result {
        Ok(res) => res,
        Err(err) => {
            return HttpResponse::InternalServerError().json(
                serde_json::json!({"error": format!("Failed to contact FastAPI: {}", err)}),
            );
        }
    };

    // 👇 Debug: print the raw response body
    let text = resp.text().await.unwrap_or_else(|e| format!("Failed to read body: {}", e));
    println!("Raw FastAPI Response: {}", text);

    // 👇 Attempt to parse it
    let api_response = serde_json::from_str::<Vec<ProductSummary>>(&text);
    println!("Parsed ProductSummary: {:?}", api_response);

    match api_response {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(err) => HttpResponse::InternalServerError().json(
            serde_json::json!({"error": format!("Failed to parse FastAPI response: {}", err)}),
        ),
    }
}

pub async fn gen_ai(request :web::Json<genAI_request>, req: HttpRequest) -> impl Responder {
    let user_db = match req.cookie("Data")
        .and_then(|cookie| serde_json::from_str::<LogInUser>(cookie.value()).ok())
    {
        Some(user) => user.database_name,
        None => {
            return HttpResponse::BadRequest().json(
                serde_json::json!({"error": "Failed to retrieve user database from cookie"}),
            );
        }
    };

    let url = format!(
        "http://127.0.0.1:6969/genAI/{}/{}?msg={}",
        user_db,
        request.action,
        urlencoding::encode(request.message.as_deref().unwrap_or(""))
    );
    println!("gen_ai URL: {}", url);

    let client = Client::new();
    let resp_result = client.put(&url).send().await;

    let resp = match resp_result {
        Ok(res) => res,
        Err(err) => {
            return HttpResponse::InternalServerError().json(
                serde_json::json!({"error": format!("Failed to contact FastAPI: {}", err)}),
            );
        }
    };

    // 👇 Debug: print the raw response body
    let text = resp.text().await.unwrap_or_else(|e| format!("Failed to read body: {}", e));
    println!("Raw gen_ai FastAPI Response: {}", text);

    // 👇 Attempt to parse it
    let api_response = serde_json::from_str::<genAI>(&text);
    println!("Parsed gen_ai: {:?}", api_response);

    match api_response {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(err) => HttpResponse::InternalServerError().json(
            serde_json::json!({"error": format!("Failed to parse FastAPI response: {}", err)}),
        ),
    }
}
