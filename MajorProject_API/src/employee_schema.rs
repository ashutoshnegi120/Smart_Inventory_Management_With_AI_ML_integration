diesel::table! {
    orders (order_id) {
        order_id -> Int4,
        supplier_name -> Varchar,
        product_id -> Array<Text>,
        categories -> Array<Text>,
        quantity_ordered -> Array<Int4>,
        price -> Array<Float4>,
        order_date -> Nullable<Timestamp>,
        status -> Varchar,
    }
}

diesel::table! {
    logs (log_id) {
        log_id -> Int4,
        activity -> Varchar,
        performed_by -> Int4,
        timestamp -> Nullable<Timestamp>,
    }
}

diesel::table! {
    sales (sale_id) {
        sale_id -> Int4,
        product_id -> Array<Text>,
        quantity_sold -> Array<Int4>,
        price -> Array<Float8>,
        total_price -> Float8,
        sold_by -> Int4,
        sale_date -> Nullable<Timestamp>,
        categories -> Array<Text>,
    }
}

diesel::table! {
    employees (employee_id) {
        employee_id -> Int4,
        name -> Text,
        email -> Text,
        #[max_length = 255]
        password -> VarChar,
        permission -> Text,
        first_time_password -> Bool,
        created_at -> Nullable<Timestamp>,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    orders,
    logs,
    sales,
    employees,
);