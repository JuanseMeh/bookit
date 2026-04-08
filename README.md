# BookIt - Booking system.

[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-Ready-blue)](https://docs.docker.com/compose/)
[![Rust Backend](https://img.shields.io/badge/Backend-Rust%20Axum-red?logo=rust)](https://www.rust-lang.org/)
[![Next.js Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-brightgreen?logo=next.js)](https://nextjs.org/)
[![Postgres DB](https://img.shields.io/badge/Database-PostgreSQL-brightpurple?logo=postgresql)](https://www.postgresql.org/)

BookIt is a full-stack appointment booking system built for Docker Compose deployment. Users can browse services, book appointments, view/filter appointments by status, mark as done, or cancel.

## Quick Start

1. Clone/pull the repo
2. Run **one command**:
   ```bash
   docker compose up -d
   ```
3. Access the app:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend Health**: [http://localhost:3001/health](http://localhost:3001/health)

All services (frontend, backend, Postgres DB) will start automatically with healthchecks. Data persists via volumes.

## Features

### Frontend (Next.js / React / Tailwind)
- Tabbed UI: Services | Create Appointment | List Appointments
- List available services (auto-seeded)
- Create appointment (client name, email, date/time, service)
- List/filter appointments (ALL/PENDING/DONE/CANCELLED)
- Update status: Mark DONE | CANCEL
- Delete/cancel appointment
- Error handling & loading states

### Backend (Rust / Axum / SQLx)
- **Endpoints**:
  | Method | Endpoint | Description |
  |--------|----------|-------------|
  | GET | `/health` | Health check |
  | GET | `/services` | List services |
  | GET | `/appointments` | List all appointments |
  | POST | `/appointments` | Create (requires service_id, validates fields) |
  | PATCH | `/appointments/:id/status` | Update status (DONE/CANCELLED, enforces rules) |
  | DELETE | `/appointments/:id` | Delete |
- Auto-creates tables & seeds demo services on first run:
  - Corte de cabello (30min)
  - Asesoría académica (60min)
  - Consulta técnica (45min)
- Business rules: No empty creates, CANCELLED → no DONE, DONE → no CANCEL

### Database (Postgres 18)
- Tables: `services`, `appointments` (UUID PK, foreign keys)
- Persistent volume: `postgres_data`

## Architecture

```
localhost:3000 (Frontend: Next.js) ───➤ localhost:3001 (Backend: Rust/Axum)
                                                           ↓
                                                    Postgres:5432 (DB)
```
- Networks: `server-network` (backend↔db), `client-network` (frontend↔backend)
- Healthchecks ensure startup order
- CORS permissive for frontend

## 🐳 Docker Images (Published to Docker Hub)

| Service | Image | Port |
|---------|--------|------|
| Frontend | `mrpolvos/bookit-frontend:latest` | 3000 |
| Backend | `mrpolvos/bookit-backend:latest` | 3001 |
| DB | `postgres:18-alpine` | 5432 |

## Local Development (Optional)

1. Backend:
   ```bash
   cd backend
   cp .env.example .env  # Set DATABASE_URL
   cargo run
   ```

2. Frontend:
   ```bash
   cd frontend
   cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:3001
   npm install
   npm run dev
   ```

3. DB: Use Docker or local Postgres with `.env.example` creds.

## Project Structure

```
.
├── docker-compose.yml       # Orchestration + healthchecks
├── README.md               # This file
├── .env.example            # Env template
├── backend/                # Rust/Axum/SQLx
│   ├── Cargo.toml
│   ├── Dockerfile
│   └── src/
├── frontend/               # Next.js/Tailwind
│   ├── package.json
│   ├── Dockerfile
│   └── app/
└── ...
```

## Health & Logs

```bash
docker compose ps      # Status
docker compose logs    # All logs
docker compose logs backend  # Specific
```

## Future Improvements (Optional Points)

- Authentication
- Time slot validation/availability
- User accounts
- Multi-stage Docker builds
- Migrations (beyond auto-init)
- Tests
- CI/CD

## Credits

Built for Docker Compose full-stack deployment challenge. Fully functional with `docker compose up -d` – no manual steps!

---

**$ bookit terminal >_**

