use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, patch, delete},
    Router, serve::serve,
    Json
};
use serde_json::{json, Value};
use tokio::net::TcpListener;
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use tracing_subscriber::fmt;
use uuid::Uuid;
use std::env;


mod models;
mod db;

use models::{Appointment, CreateAppointment, Service};
use db::{create_pool, get_services, get_appointments, create_appointment, update_status, delete_appointment};

#[tokio::main]
async fn main() {
    fmt::init();
    dotenv::dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = create_pool(&database_url).await.expect("Failed to create pool");

    let app = Router::new()
        .route("/health", get(health))
        .route("/services", get(services))
        .route("/appointments", get(appointments).post(create_app))
        .route("/appointments/:id/status", patch(update_app_status))
        .route("/appointments/:id", delete(delete_app))
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(pool);

    let listener = TcpListener::bind("0.0.0.0:3001").await.unwrap();
    println!("Server running on http://0.0.0.0:3001");
    serve(listener, app.into_make_service()).await.unwrap();
}

async fn health() -> &'static str {
    "OK"
}

async fn services(State(state): State<sqlx::PgPool>) -> Json<Vec<Service>> {
    match get_services(&state).await {
        Ok(s) => Json(s),
        Err(_) => Json(vec![]),
    }
}

async fn appointments(State(state): State<sqlx::PgPool>) -> Json<Vec<Appointment>> {
    match get_appointments(&state).await {
        Ok(a) => Json(a),
        Err(_) => Json(vec![]),
    }
}

async fn create_app(State(state): State<sqlx::PgPool>, Json(payload): Json<CreateAppointment>) -> (StatusCode, Json<serde_json::Value>) {
    let app = Appointment {
        id: Uuid::nil(),
        client_name: payload.client_name.clone(),
        client_email: payload.client_email.clone(),
        date: payload.date.clone(),
        time: payload.time.clone(),
        status: "PENDING".to_string(),
        service_id: payload.service_id,
    };
    match create_appointment(&state, &app).await {
        Ok(id) => (StatusCode::CREATED, Json(json!({"id": id}))),
        Err(e) => (StatusCode::BAD_REQUEST, Json(json!({"error": e.to_string()}))),
    }
}

async fn update_app_status(State(state): State<sqlx::PgPool>, Path(id): Path<Uuid>, Json(payload): Json<Value>) -> StatusCode {
    if let Some(status) = payload.get("status").and_then(|v| v.as_str()) {
        if update_status(&state, id, status).await.is_ok() {
            StatusCode::OK
        } else {
            StatusCode::BAD_REQUEST
        }
    } else {
        StatusCode::BAD_REQUEST
    }
}

async fn delete_app(Path(id): Path<Uuid>, State(state): State<sqlx::PgPool>) -> StatusCode {
    if delete_appointment(&state, id).await.is_ok() {
        StatusCode::OK
    } else {
        StatusCode::NOT_FOUND
    }
}
