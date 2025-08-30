use actix_web::web;
use crate::handlers::user_handler::{create_user,login_data};
use crate::handlers::employee_handler::{employee_add, employee_login, password_change, update_employee_permission,show_all_employee};
use crate::handlers::tools::{set_orders, display_orders, status_change, set_sales, show_all_sales, get_inventory};
use crate::Request_microservice::request::{analytics_data, category_summary, daily_sales_summary, gen_ai, low_stock_count, product_summary};

pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/users", web::post().to(create_user)) //check-
            .route("/login", web::post().to(login_data))  //check-
            .route("/employee-add", web::post().to(employee_add)) //check-
            .route("/employee_login", web::post().to(employee_login)) //check-
            .route("/employee-update", web::patch().to(update_employee_permission))
            .route("/password_change", web::patch().to(password_change))//check-
            .route("/set-orders", web::post().to(set_orders)) //check-
            .route("/display-orders", web::get().to(display_orders)) //check-
            .route("/status-change", web::patch().to(status_change))//check-
            .route("/sale_set",web::post().to(set_sales))//check
            .route("/show-sales",web::get().to(show_all_sales))
            .route("/show-all-emp",web::get().to(show_all_employee)) //check-
            .route("/get_inventory",web::get().to(get_inventory)) //check-
            .route("/analytics_data",web::get().to(analytics_data))
            .route("/low-stock-count",web::get().to(low_stock_count))
            .route("/daily_sales_summary",web::get().to(daily_sales_summary))
            .route("/category_summary",web::get().to(category_summary))
            .route("/product_summary",web::get().to(product_summary))
            .route("/gen_ai",web::post().to(gen_ai))
    );
}

