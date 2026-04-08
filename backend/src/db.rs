use anyhow::Result;
use sqlx::{postgres::PgPoolOptions, PgPool, Row};
use uuid::Uuid;
use crate::models::{Service, Appointment};

pub async fn create_pool(database_url: &str) -> Result<PgPool> {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await?;
    init_db(&pool).await?;
    Ok(pool)
}

async fn init_db(pool: &PgPool) -> Result<()> {
    // Create tables
    sqlx::query("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
        .execute(pool)
        .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS services (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            duration_minutes INTEGER NOT NULL
        );
        "#,
    )
        .execute(pool)
        .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS appointments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_name TEXT NOT NULL,
            client_email TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'PENDING',
            service_id UUID REFERENCES services(id)
        );
        "#,
    )
        .execute(pool)
        .await?;

    // Seed services if empty
    let count: i64 = sqlx::query("SELECT COUNT(*) FROM services")
        .fetch_one(pool)
        .await?
        .get(0);
    if count == 0 {
        let services = vec![
            Service { id: Uuid::nil(), name: "Corte de cabello".to_string(), description: "Corte básico".to_string(), duration_minutes: 30 },
            Service { id: Uuid::nil(), name: "Asesoría académica".to_string(), description: "Asesoría 1 hora".to_string(), duration_minutes: 60 },
            Service { id: Uuid::nil(), name: "Consulta técnica".to_string(), description: "Soporte técnico".to_string(), duration_minutes: 45 },
        ];

        for service in services {
            sqlx::query("INSERT INTO services (name, description, duration_minutes) VALUES ($1, $2, $3)")
                .bind(&service.name)
                .bind(&service.description)
                .bind(service.duration_minutes)
                .execute(pool)
                .await?;
        }
    }
    Ok(())
}

pub async fn get_services(pool: &PgPool) -> Result<Vec<Service>> {
    let services = sqlx::query_as::<_, Service>("SELECT * FROM services")
        .fetch_all(pool)
        .await?;
    Ok(services)
}

pub async fn create_appointment(pool: &PgPool, app: &Appointment) -> Result<Uuid> {
    // Minimal validation
    if app.client_name.is_empty() || app.client_email.is_empty() || app.service_id == Uuid::nil() {
        return Err(anyhow::anyhow!("Missing required fields"));
    }
    let id = sqlx::query_scalar(
        "INSERT INTO appointments (client_name, client_email, date, time, status, service_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id"
    )
        .bind(&app.client_name)
        .bind(&app.client_email)
        .bind(&app.date)
        .bind(&app.time)
        .bind("PENDING")
        .bind(app.service_id)
        .fetch_one(pool)
        .await?;
    Ok(id)
}

pub async fn get_appointments(pool: &PgPool) -> Result<Vec<Appointment>> {
    let apps = sqlx::query_as::<_, Appointment>("SELECT * FROM appointments ORDER BY date, time")
        .fetch_all(pool)
        .await?;
    Ok(apps)
}

pub async fn update_status(pool: &PgPool, id: Uuid, status: &str) -> Result<()> {
    // Rules: cancelled can't be done, done can't be cancelled
    let current: String = sqlx::query_scalar("SELECT status FROM appointments WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await?
        .ok_or(anyhow::anyhow!("Appointment not found"))?;
    
    if current == "CANCELLED" && status == "DONE" {
        return Err(anyhow::anyhow!("Cancelled appointment can't be marked done"));
    }
    if current == "DONE" && status == "CANCELLED" {
        return Err(anyhow::anyhow!("Done appointment can't be cancelled"));
    }
    
    sqlx::query("UPDATE appointments SET status = $1 WHERE id = $2")
        .bind(status)
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn delete_appointment(pool: &PgPool, id: Uuid) -> Result<()> {
    let count = sqlx::query("DELETE FROM appointments WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?.rows_affected();
    if count == 0 {
        return Err(anyhow::anyhow!("Appointment not found"));
    }
    Ok(())
}
