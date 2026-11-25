from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import MessageOut, PatientCreate, PatientOut, PatientUpdate

router = APIRouter(prefix="/api/patients", tags=["Patients"])


def _get_patient_or_404(db: Session, patient_id: int):
    """Fetch a patient or raise a standard HTTP 404 response."""
    patient = crud.get_patient(db, patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with id {patient_id} not found",
        )
    return patient


@router.get("", response_model=list[PatientOut])
def get_patients(
    search: Optional[str] = Query(default=None),
    ward: Optional[str] = Query(default=None),
    department: Optional[str] = Query(default=None),
    doctor: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    """List all patients, optionally filtered by name search, ward, department, and doctor."""
    return crud.list_patients(
        db=db,
        search=search,
        ward=ward,
        department=department,
        doctor=doctor,
    )


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient_by_id(patient_id: int, db: Session = Depends(get_db)):
    """Retrieve a single patient by ID."""
    return _get_patient_or_404(db, patient_id)


@router.post("", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    """Create a new patient admission record."""
    return crud.create_patient(db, payload)


@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: int,
    payload: PatientUpdate,
    db: Session = Depends(get_db),
):
    """Update an existing patient's details."""
    patient = _get_patient_or_404(db, patient_id)
    return crud.update_patient(db, patient, payload)


@router.patch("/{patient_id}/discharge", response_model=PatientOut)
def discharge_patient(patient_id: int, db: Session = Depends(get_db)):
    """Mark an admitted patient as Discharged."""
    patient = _get_patient_or_404(db, patient_id)
    return crud.discharge_patient(db, patient)


@router.delete("/{patient_id}", response_model=MessageOut)
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    """Delete a patient record by ID."""
    patient = _get_patient_or_404(db, patient_id)
    crud.delete_patient(db, patient)
    return MessageOut(message="Patient deleted successfully", id=patient_id)

