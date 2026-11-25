from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import ALLOWED_ORIGINS
from app.database import Base, SessionLocal, engine
from app.routers import options, patients
from app.seed import seed_initial_patients


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables and seed sample data on server startup."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_patients(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Patient Admission Management API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    """Return consistent, human-readable 422 field errors for frontend forms and API clients."""
    formatted_errors = []
    for err in exc.errors():
        loc = err.get("loc", [])
        # Skip leading location prefixes like "body" or "query"
        field = str(loc[-1]) if loc else "request"
        message = str(err.get("msg", "Invalid value"))
        if message.startswith("Value error, "):
            message = message.replace("Value error, ", "", 1)
        formatted_errors.append({"field": field, "message": message})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": formatted_errors},
    )


@app.get("/health", tags=["Health"])
def health_check():
    """Simple health check endpoint for Render/uptime monitoring."""
    return {"status": "ok"}


app.include_router(options.router)
app.include_router(patients.router)

