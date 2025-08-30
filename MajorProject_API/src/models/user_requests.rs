use std::fmt;
// src/models/user_requests.rs
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};
use crate::schema::{users};
use crate::employee_schema::employees;
use chrono::NaiveDateTime;
use crate::models::tools::Status;

#[derive(Deserialize)]
pub struct CreateUserRequest {
    pub name: String,
    pub email: String,
    pub password: String,
    pub role: String,
    pub company_name: String,
}

#[derive(Serialize)]
pub struct CreateUserResponse {
    pub message: String,
}


#[derive(Queryable, Insertable, Serialize, Deserialize)]
#[diesel(table_name = users)]
pub struct User {
    pub user_id: Option<i32>,
    pub name: String,
    pub email: String,
    pub password: String,
    pub role: String,
    pub company_name: String,
    pub database_name: String,
    pub created_at: Option<NaiveDateTime>
}

//for login
#[derive(Deserialize, Debug)]
pub struct CreateUserLogInRequest {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct CreateUserLogInResponse {
    pub message: String,
}

#[derive(Queryable, Insertable, Serialize, Deserialize, Debug)]
#[diesel(table_name = users)]
pub struct LogInUser {
    pub user_id: i32,
    pub name: String,
    pub email: String,
    pub password: String,
    pub role: String,
    pub company_name: String,
    pub database_name: String,
    pub created_at: Option<NaiveDateTime>,
}

//for Employee creation/login

#[derive(Queryable, Insertable, Serialize,Deserialize)]
#[diesel(table_name = employees)]
pub struct Employee {
    pub employee_id: Option<i32>,
    pub name: String,
    pub password: String,
    pub email: String,
    pub permission: String,
    pub first_time_password: bool,
    pub created_at: Option<NaiveDateTime>,
}

#[derive(Queryable, Insertable, Serialize, Deserialize, Debug,Clone)]
#[diesel(table_name = employees)]
pub struct LoginEmployee {
    pub employee_id:i32,
    pub name: String,
    pub email: String,
    pub password: String,
    pub permission: String,
    pub first_time_password: bool,
    pub created_at: Option<NaiveDateTime>,
}


#[derive(Deserialize)]
pub struct CreateEmployeeRequest {
    pub name: String,
    pub password: String,
    pub email: String,
    pub permission: String,
}

#[derive(Deserialize,Serialize)]
pub struct EmployeeLogInRequest {
    pub email: String,
    pub password: String,
    pub company_name: String,
}

#[derive(Serialize)]
pub struct EmployeeLogInResponse {
    pub message: String,
}

#[derive(Deserialize)]
pub struct EmployeeAdminControl {
    pub id: i32,
    pub permission: String,
}