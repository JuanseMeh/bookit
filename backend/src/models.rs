
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Service {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub duration_minutes: i32,
}




#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Appointment {
    pub id: Uuid,
    pub client_name: String,
    pub client_email: String,
    pub date: String, // YYYY-MM-DD
    pub time: String, // HH:MM
    pub status: String,
    pub service_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CreateAppointment {
    pub client_name: String,
    pub client_email: String,
    pub date: String,
    pub time: String,
    pub service_id: Uuid,
}

