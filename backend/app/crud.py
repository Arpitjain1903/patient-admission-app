from typing import Optional

from sqlalchemy.orm import Session

from app.models import Patient
from app.schemas import PatientCreate, PatientUpdate


def list_patients(
    db: Session,
    search: Optional[str] = None,
    ward: Optional[str] = None,
    department: Optional[str] = None,
    doctor: Optional[str] = None,
) -> list[Patient]:
    """Return patients filtered by optional search query and dropdown selections."""
    query = db.query(Patient)

    if search and search.strip():
        # ilike performs a case-insensitive partial match across SQLite and PostgreSQL
        pattern = f"%{search.strip()}%"
        query = query.filter(Patient.name.ilike(pattern))

    if ward and ward.strip():
        query = query.filter(Patient.ward == ward.strip())

    if department and department.strip():
        query = query.filter(Patient.department == department.strip())

    if doctor and doctor.strip():
        query = query.filter(Patient.doctor == doctor.strip())

    return query.order_by(Patient.id.desc()).all()


def get_patient(db: Session, patient_id: int) -> Optional[Patient]:
    """Fetch a single patient by primary key ID."""
    return db.query(Patient).filter(Patient.id == patient_id).first()


def create_patient(db: Session, payload: PatientCreate) -> Patient:
    """Insert a new validated patient record into the database."""
    patient = Patient(**payload.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def update_patient(
    db: Session, patient: Patient, payload: PatientUpdate
) -> Patient:
    """Update all editable fields of an existing patient record."""
    for field, value in payload.model_dump().items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient


def discharge_patient(db: Session, patient: Patient) -> Patient:
    """Mark an existing patient as Discharged."""
    patient.status = "Discharged"
    db.commit()
    db.refresh(patient)
    return patient


def delete_patient(db: Session, patient: Patient) -> None:
    """Permanently delete a patient record from the database."""
    db.delete(patient)
    db.commit()

