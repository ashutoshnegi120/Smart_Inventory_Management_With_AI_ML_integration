// @generated automatically by Diesel CLI.

diesel::table! {
    users (user_id) {
        user_id -> Int4,
        #[max_length = 100]
        name -> Varchar,
        #[max_length = 255]
        email -> Varchar,
        #[max_length = 255]
        password -> Varchar,
        role -> Text,
        #[max_length = 255]
        company_name -> Varchar,
        #[max_length = 255]
        database_name -> Varchar,
        created_at -> Nullable<Timestamp>,
    }
}
