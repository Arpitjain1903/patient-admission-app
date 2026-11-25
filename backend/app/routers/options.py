from fastapi import APIRouter

from app.config import (
    DEPARTMENT_OPTIONS,
    DOCTOR_OPTIONS,
    GENDER_OPTIONS,
    STATUS_OPTIONS,
    WARD_OPTIONS,
)
from app.schemas import OptionsOut

router = APIRouter(prefix="/api/options", tags=["Options"])


@router.get("", response_model=OptionsOut)
def get_options():
    """Return allowed dropdown values so frontend and backend share one source of truth."""
    return OptionsOut(
        genders=GENDER_OPTIONS,
        wards=WARD_OPTIONS,
        departments=DEPARTMENT_OPTIONS,
        doctors=DOCTOR_OPTIONS,
        statuses=STATUS_OPTIONS,
    )

