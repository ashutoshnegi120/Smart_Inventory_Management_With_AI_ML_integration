use std::env;
use std::string::String;
use actix_web::{cookie, web, HttpRequest, HttpResponse, Responder};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Utc;
use crate::models::user_requests::{CreateEmployeeRequest, Employee, EmployeeLogInResponse, EmployeeAdminControl, EmployeeLogInRequest, LogInUser, CreateUserLogInResponse, LoginEmployee};
use crate::connect_sql::sql_handler::{establish_connection_to_user_db, establish_connection_to_user_db_without_cookies, DbError, DbPool, LogInUser as log_in_user};
use crate::employee_schema::employees;
use crate::employee_schema::employees::dsl::*;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, PooledConnection};
use diesel::row::NamedRow;
use log::error;
use serde::Deserialize;
use serde_json::{json, Value};
use crate::employee_schema::orders::dsl::orders;
use crate::models::tools::OrderField;

#[derive(Deserialize)]
pub struct PasswordChange {
    id : i32,
    password: String,
    re_password: String,
}
pub async fn connect_db(req: &HttpRequest) -> Result<PooledConnection<ConnectionManager<PgConnection>>, HttpResponse> {
    // Get user-specific database pool
    let pool = match establish_connection_to_user_db(req) {
        Ok(pool) => pool,
        Err(err) => {
            error!("Failed to establish DB connection: {:?}", err);
            return Err(HttpResponse::InternalServerError().json("Failed to establish DB connection"));
        }
    };

    // Get a database connection from the pool
    match pool.get() {
        Ok(conn) => Ok(conn), // Successfully got connection
        Err(err) => {
            error!("Failed to get DB connection: {:?}", err);
            Err(HttpResponse::InternalServerError().json("Failed to get DB connection"))
        }
    }
}
pub async fn connect_db_another(database_name: String) -> Result<PooledConnection<ConnectionManager<PgConnection>>, HttpResponse> {
    // Get user-specific database pool
    let pool = match establish_connection_to_user_db_without_cookies(database_name) {
        Ok(pool) => pool,
        Err(err) => {
            error!("Failed to establish DB connection: {:?}", err);
            return Err(HttpResponse::InternalServerError().json("Failed to establish DB connection"));
        }
    };

    // Get a database connection from the pool
    match pool.get() {
        Ok(conn) => Ok(conn), // Successfully got connection
        Err(err) => {
            error!("Failed to get DB connection: {:?}", err);
            Err(HttpResponse::InternalServerError().json("Failed to get DB connection"))
        }
    }
}
pub async fn employee_add(user_request: web::Json<CreateEmployeeRequest>, req: HttpRequest) -> impl Responder {
    // Get database connection pool

    let mut conn = match connect_db(&req).await {
        Ok(conn) => {
            conn
        },
        Err(err) => {
                return err
        }
    };

    // Clone password for hashing
    let password_clone = user_request.password.clone();

    // Hash password using a blocking thread
    let hashed_password = match web::block(move || hash(&password_clone, DEFAULT_COST)).await {
        Ok(Ok(hash)) => hash,
        Ok(Err(err)) => {
            error!("Password hashing failed: {:?}", err);
            return HttpResponse::InternalServerError().json("Password hashing failed");
        }
        Err(err) => {
            error!("Thread pool error during password hashing: {:?}", err);
            return HttpResponse::InternalServerError().json("Password hashing failed");
        }
    };

    // Create new employee
    let new_employee = Employee {
        employee_id: None,
        name: user_request.name.clone(),
        password: hashed_password,
        email: user_request.email.clone(),
        permission: user_request.permission.clone(),
        first_time_password: true,
        created_at: Some(Utc::now().naive_utc()),
    };

    // Insert into database using a blocking thread
    let insert_result = web::block(move || {
        diesel::insert_into(employees::table)
            .values(&new_employee)
            .execute(&mut conn)
    }).await;

    match insert_result {
        Ok(Ok(_)) => HttpResponse::Created().json(EmployeeLogInResponse {
            message: "User created successfully".to_string(),
        }),
        Ok(Err(e)) => {
            error!("Failed to insert user: {:?}", e);
            HttpResponse::InternalServerError().json("Failed to create user")
        }
        Err(e) => {
            error!("Thread pool error during database insert: {:?}", e);
            HttpResponse::InternalServerError().json("Database insert failed")
        }
    }
}
// this function is used by admin not by employee
pub async fn update_employee_permission( user_request: web::Json<EmployeeAdminControl>,req:HttpRequest) -> impl Responder {

    let mut conn = match connect_db(&req).await {
        Ok(conn) => {
            conn
        },
        Err(err) => {
            return err
        }
    };
    let update_result = diesel::update(employees.filter(employee_id.eq(user_request.id.clone())))
        .set(permission.eq(user_request.permission.clone()))
        .execute(&mut conn);

    match update_result {
        Ok(rows_affected) => {
            if rows_affected == 0 {
                HttpResponse::NotFound().json("Employee not found")
            } else {
                HttpResponse::Ok().json("Permission updated successfully")
            }
        }
        Err(_) => HttpResponse::InternalServerError().json("Failed to update permission"),
    }
}
pub async fn employee_login(pool: web::Data<DbPool>, user_request: web::Json<EmployeeLogInRequest>) -> impl Responder {


    let mut conn = match pool.get() {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().json("Failed to get a database connection"),
    };

    let result = crate::schema::users::table
        .filter(crate::schema::users::company_name.eq(user_request.company_name.clone()))
        .first::<LogInUser>(&mut conn)
        .optional()
        .expect("Error loading admin data");


    let cookie;
    let database_name;
    if let Some(admin_data) = result {
        database_name =  log_in_user{
            database_name : admin_data.database_name.clone(),
        };
        let cookie_data = serde_json::to_string(&database_name)
            .expect("Failed to serialize user");

        cookie = cookie::Cookie::build("Data", cookie_data)
            .path("/")
            .http_only(true)
            .secure(false)
            .finish();
    } else {
        return HttpResponse::InternalServerError().json(serde_json::json!({ "message": "Cookie set successfully" }));
    }

    // Now connect to the user database
    conn = match connect_db_another(database_name.database_name).await {
        Ok(conn) => conn,
        Err(err) => return err,
    };


    let result = employees::table
        .filter(email.eq(user_request.email.clone()))
        .first::<LoginEmployee>(&mut conn)
        .optional()
        .expect("Error loading employee data");

    if let Some(emp) = result {
        if verify(&user_request.password, &emp.password).unwrap_or(false) {
            HttpResponse::Ok().cookie(cookie).json(serde_json::json!({ "message" : "login successfully" , "result":emp}))
        } else {
            HttpResponse::BadRequest().json(serde_json::json!({ "message": "wrong password" }))
        }
    }else {
        HttpResponse::NotFound().json("Employee not found")
    }


}
pub async fn password_change(user_request : web::Json<PasswordChange>, req:HttpRequest) -> impl Responder {
    let mut conn = match connect_db(&req).await {
        Ok(conn) => {
            conn
        },
        Err(err) => {
            return err
        }
    };

    if user_request.password != user_request.re_password{
        return HttpResponse::InternalServerError().json("Password mismatch");
    }

    let hashed_password = match hash(&user_request.password, DEFAULT_COST) {
        Ok(hash) => hash,
        Err(_) => return HttpResponse::InternalServerError().json("Password hashing failed"),
    };

    let update_result = diesel::update(employees.filter(employee_id.eq(user_request.id.clone())))
        .set(password.eq(hashed_password.clone()))
        .execute(&mut conn);

    match update_result {
        Ok(rows_affected) => {
            if rows_affected == 0 {
                HttpResponse::NotFound().json("Employee not found")
            } else {
                HttpResponse::Ok().json("password updated successfully")
            }
        }
        Err(_) => HttpResponse::InternalServerError().json("Failed to update permission"),
    }
}
pub async fn show_all_employee(req: HttpRequest) -> impl Responder {
    let mut conn = match connect_db(&req).await {
        Ok(conn) => conn,
        Err(err) => return err,
    };
    match employees.load::<LoginEmployee>(&mut conn) {
        Ok(employees_list) => HttpResponse::Ok().json(json!({"employees_list": employees_list})),
        Err(_) => HttpResponse::InternalServerError().body("Error retrieving orders"),
    }
}
