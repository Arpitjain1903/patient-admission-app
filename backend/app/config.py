import os
from dotenv import load_dotenv

# Load variables from .env if present (safe no-op in production where env vars are injected)
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./patients.db")

# Normalize postgres:// to postgresql:// for SQLAlchemy 2.x compatibility (e.g., Render/Heroku)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Support single or comma-separated allowed origins
_raw_origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
ALLOWED_ORIGINS = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]

# Single source of truth for dropdown options
GENDER_OPTIONS = ["Male", "Female", "Other"]

WARD_OPTIONS = [
    "General Ward",
    "ICU",
    "Emergency",
    "Maternity",
    "Pediatric",
    "Private",
]

DEPARTMENT_OPTIONS = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "General Medicine",
    "Gynecology",
]

DOCTOR_OPTIONS = [
    "Dr. Anil Sharma",
    "Dr. Priya Verma",
    "Dr. Rahul Mehta",
    "Dr. Sneha Iyer",
    "Dr. Vikram Singh",
    "Dr. Neha Gupta",
]

STATUS_OPTIONS = ["Admitted", "Discharged"]

