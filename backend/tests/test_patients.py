from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

# Use an isolated in-memory SQLite database for tests so local patients.db is untouched
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_database():
    """Recreate tables before each test for complete isolation."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


client = TestClient(app)


def sample_payload(**overrides):
    data = {
        "name": "John Doe",
        "age": 35,
        "gender": "Male",
        "ward": "ICU",
        "department": "Cardiology",
        "doctor": "Dr. Anil Sharma",
        "admission_date": date.today().isoformat(),
        "status": "Admitted",
    }
    data.update(overrides)
    return data


def test_get_options():
    res = client.get("/api/options")
    assert res.status_code == 200
    body = res.json()
    assert "Male" in body["genders"]
    assert "ICU" in body["wards"]
    assert "Cardiology" in body["departments"]
    assert "Dr. Anil Sharma" in body["doctors"]


def test_create_list_update_discharge_delete_patient():
    # Create
    create_res = client.post("/api/patients", json=sample_payload(name="  Jane Smith  "))
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["name"] == "Jane Smith"
    assert created["status"] == "Admitted"
    patient_id = created["id"]

    # Get by ID
    get_res = client.get(f"/api/patients/{patient_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Jane Smith"

    # Search & combinable filters
    list_res = client.get(
        "/api/patients",
        params={"search": "jane", "ward": "ICU", "department": "Cardiology"},
    )
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # Update
    update_res = client.put(
        f"/api/patients/{patient_id}",
        json=sample_payload(name="Jane Marie Smith", age=36, ward="Private"),
    )
    assert update_res.status_code == 200
    assert update_res.json()["ward"] == "Private"
    assert update_res.json()["age"] == 36

    # Discharge
    discharge_res = client.patch(f"/api/patients/{patient_id}/discharge")
    assert discharge_res.status_code == 200
    assert discharge_res.json()["status"] == "Discharged"

    # Delete
    delete_res = client.delete(f"/api/patients/{patient_id}")
    assert delete_res.status_code == 200

    # Confirm 404 after delete
    missing_res = client.get(f"/api/patients/{patient_id}")
    assert missing_res.status_code == 404


def test_validation_errors():
    # Invalid name (digits)
    res = client.post("/api/patients", json=sample_payload(name="John123"))
    assert res.status_code == 422
    assert res.json()["detail"][0]["field"] == "name"

    # Invalid age (>120)
    res = client.post("/api/patients", json=sample_payload(age=150))
    assert res.status_code == 422
    assert res.json()["detail"][0]["field"] == "age"
    assert "0 and 120" in res.json()["detail"][0]["message"]

    # Invalid dropdown value
    res = client.post("/api/patients", json=sample_payload(ward="Unknown Ward"))
    assert res.status_code == 422
    assert res.json()["detail"][0]["field"] == "ward"

    # Future admission date
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    res = client.post("/api/patients", json=sample_payload(admission_date=tomorrow))
    assert res.status_code == 422
    assert res.json()["detail"][0]["field"] == "admission_date"

    # Invalid status
    res = client.post("/api/patients", json=sample_payload(status="Pending"))
    assert res.status_code == 422
    assert res.json()["detail"][0]["field"] == "status"

