import re
from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.config import (
    DEPARTMENT_OPTIONS,
    DOCTOR_OPTIONS,
    GENDER_OPTIONS,
    STATUS_OPTIONS,
    WARD_OPTIONS,
)

NAME_REGEX = re.compile(r"^[A-Za-z]+(?: [A-Za-z]+)*$")


class PatientBase(BaseModel):
    """Shared fields and validation rules for creating and updating patients."""

    name: str
    age: int
    gender: str
    ward: str
    department: str
    doctor: str
    admission_date: date
    status: Literal["Admitted", "Discharged"] = "Admitted"

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, value):
        if not isinstance(value, str):
            raise ValueError("Name must be a text value")
        trimmed = value.strip()
        if len(trimmed) < 2 or len(trimmed) > 100:
            raise ValueError("Name must be between 2 and 100 characters")
        if not NAME_REGEX.match(trimmed):
            raise ValueError(
                "Name must contain only letters and single spaces between words"
            )
        return trimmed

    @field_validator("age", mode="before")
    @classmethod
    def validate_age(cls, value):
        if isinstance(value, bool) or value is None or value == "":
            raise ValueError("Age must be a whole number between 0 and 120")
        if isinstance(value, float):
            raise ValueError("Age must be a whole number (no decimals)")
        if isinstance(value, str):
            stripped = value.strip()
            if not re.fullmatch(r"-?\d+", stripped):
                raise ValueError("Age must be a whole number between 0 and 120")
            value = int(stripped)
        if not isinstance(value, int):
            raise ValueError("Age must be a whole number between 0 and 120")
        if value < 0 or value > 120:
            raise ValueError("Age must be between 0 and 120")
        return value

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, value: str) -> str:
        if value not in GENDER_OPTIONS:
            raise ValueError(f"Gender must be one of: {', '.join(GENDER_OPTIONS)}")
        return value

    @field_validator("ward")
    @classmethod
    def validate_ward(cls, value: str) -> str:
        if value not in WARD_OPTIONS:
            raise ValueError(f"Ward must be one of: {', '.join(WARD_OPTIONS)}")
        return value

    @field_validator("department")
    @classmethod
    def validate_department(cls, value: str) -> str:
        if value not in DEPARTMENT_OPTIONS:
            raise ValueError(
                f"Department must be one of: {', '.join(DEPARTMENT_OPTIONS)}"
            )
        return value

    @field_validator("doctor")
    @classmethod
    def validate_doctor(cls, value: str) -> str:
        if value not in DOCTOR_OPTIONS:
            raise ValueError(f"Doctor must be one of: {', '.join(DOCTOR_OPTIONS)}")
        return value

    @field_validator("admission_date")
    @classmethod
    def validate_admission_date(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("Admission date cannot be in the future")
        return value

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, value):
        if value is None:
            return "Admitted"
        if value not in STATUS_OPTIONS:
            raise ValueError(f"Status must be one of: {', '.join(STATUS_OPTIONS)}")
        return value


class PatientCreate(PatientBase):
    """Schema used when adding a new patient."""

    pass


class PatientUpdate(PatientBase):
    """Schema used when editing an existing patient."""

    pass


class PatientOut(BaseModel):
    """Schema returned in API responses."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    age: int
    gender: str
    ward: str
    department: str
    doctor: str
    admission_date: date
    status: str


class OptionsOut(BaseModel):
    """Schema for GET /api/options response."""

    genders: list[str]
    wards: list[str]
    departments: list[str]
    doctors: list[str]
    statuses: list[str]


class MessageOut(BaseModel):
    """Generic response message schema."""

    message: str
    id: Optional[int] = Field(default=None)

