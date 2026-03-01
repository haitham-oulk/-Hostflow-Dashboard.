# 🏠 Morocco Property Management — MVP

Local-first property management system for Moroccan vacation rentals.

**Stack:** FastAPI · SQLite · SQLAlchemy · Pydantic

---

## Prerequisites

- **Python 3.11+**

That's it — SQLite is built into Python, no Docker needed.

---

## Quick Start

### 1. Install Python dependencies

```bash
cd property-mgmt
pip install -r requirements.txt
```

> 💡 Use a virtual environment: `python -m venv .venv && .venv\Scripts\activate` (Windows)

### 2. Run the API server

```bash
uvicorn main:app --reload
```

The server starts at **http://localhost:8000**.

A `property_mgmt.db` SQLite file is auto-created on first startup.

### 3. Open API docs

Navigate to **http://localhost:8000/docs** for the interactive Swagger UI.

---

## Project Structure

```
property-mgmt/
├── .env                 # Environment variables (git-ignored)
├── .env.example         # Template for .env
├── requirements.txt     # Python dependencies
├── db.py                # SQLAlchemy engine, session, Base (SQLite)
├── models.py            # ORM models (Property, Booking, etc.)
├── schemas.py           # Pydantic request / response models
├── main.py              # FastAPI app + all endpoints
├── property_mgmt.db     # SQLite database (auto-created, git-ignored)
└── README.md
```

---

## API Endpoints

| Method  | Endpoint                   | Description                                    |
|---------|----------------------------|------------------------------------------------|
| `POST`  | `/properties/`             | Create a property                              |
| `GET`   | `/properties/`             | List all properties                            |
| `GET`   | `/properties/{id}`         | Get a single property                          |
| `POST`  | `/bookings/`               | Create booking (auto-calculates + creates tasks)|
| `GET`   | `/bookings/`               | List all bookings                              |
| `GET`   | `/bookings/{id}`           | Get booking with financials & tasks            |
| `POST`  | `/tasks/`                  | Create a task                                  |
| `PATCH` | `/tasks/{id}`              | Update task status                             |
| `GET`   | `/tasks/`                  | List all tasks                                 |
| `POST`  | `/compliance-documents/`   | Create compliance document record              |
| `GET`   | `/compliance-documents/`   | List all compliance documents                  |

---

## Business Rules

- **Currency:** MAD (Moroccan Dirham) only
- **Commission (auto-calculated on booking creation):**
  - **Booking.com** → 20% commission + 2% payment fee (on accommodation price)
  - **Airbnb** → 3% commission
  - **Direct** → 0
- **Auto-created on new booking:**
  - 🧹 Cleaning task (due at checkout 10:00 AM)
  - 🔑 Key collection task (due at checkout 10:00 AM)
