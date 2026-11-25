from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models import Patient


def seed_initial_patients(db: Session) -> None:
    """Insert sample patients on first run if the patients table is empty."""
    existing_count = db.query(Patient).count()
    if existing_count > 0:
        return

    today = date.today()
    sample_patients = [
        Patient(
            name="Aarav Patel",
            age=45,
            gender="Male",
            ward="ICU",
            department="Cardiology",
            doctor="Dr. Anil Sharma",
            admission_date=today - timedelta(days=3),
            status="Admitted",
        ),
        Patient(
            name="Meera Krishnan",
            age=31,
            gender="Female",
            ward="Maternity",
            department="Gynecology",
            doctor="Dr. Priya Verma",
            admission_date=today - timedelta(days=2),
            status="Admitted",
        ),
        Patient(
            name="Rohan Deshmukh",
            age=8,
            gender="Male",
            ward="Pediatric",
            department="Pediatrics",
            doctor="Dr. Sneha Iyer",
            admission_date=today - timedelta(days=5),
            status="Discharged",
        ),
        Patient(
            name="Kavita Nair",
            age=62,
            gender="Female",
            ward="Private",
            department="Neurology",
            doctor="Dr. Rahul Mehta",
            admission_date=today - timedelta(days=1),
            status="Admitted",
        ),
        Patient(
            name="Suresh Reddy",
            age=54,
            gender="Male",
            ward="General Ward",
            department="Orthopedics",
            doctor="Dr. Vikram Singh",
            admission_date=today - timedelta(days=7),
            status="Discharged",
        ),
        Patient(
            name="Ananya Bose",
            age=27,
            gender="Female",
            ward="Emergency",
            department="General Medicine",
            doctor="Dr. Neha Gupta",
            admission_date=today,
            status="Admitted",
        ),
    ]

    db.add_all(sample_patients)
    db.commit()

