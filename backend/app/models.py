from sqlalchemy import Column, Date, Integer, String

from app.database import Base


class Patient(Base):
    """SQLAlchemy ORM model representing a hospital patient admission record."""

    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    ward = Column(String(50), nullable=False, index=True)
    department = Column(String(50), nullable=False, index=True)
    doctor = Column(String(100), nullable=False, index=True)
    admission_date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default="Admitted")

