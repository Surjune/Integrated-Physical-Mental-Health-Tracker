from google_fit import (
    exchange_code_for_token,
    fetch_steps,
    save_tokens,
    GOOGLE_TOKENS
)
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

# Try newer FastAPI import location first, fallback to legacy
try:
    from fastapi import RequestValidationError
except ImportError:
    from fastapi.exceptions import RequestValidationError

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

from routes import router as auth_router, health_router
from pydantic import BaseModel
from database import init_db

app = FastAPI(title="Integrated Physical & Mental Health Tracker")

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    """Initialize database tables on application startup"""
    init_db()
    logger.info("✅ Application started - Database initialized")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=400,
        content={
            "detail": "Validation error",
            "errors": exc.errors()
        },
    )

app.include_router(auth_router)
app.include_router(health_router)

@app.get("/")
def root():
    return {"status": "Backend running successfully"}


class GoogleFitCode(BaseModel):
    code: str


@app.post("/google-fit/connect")
def connect_google_fit(data: GoogleFitCode):
    token_data = exchange_code_for_token(data.code)
    save_tokens(token_data)

    return {
        "status": "connected",
        "expires_in": token_data.get("expires_in"),
        "scope": token_data.get("scope")
    }


@app.get("/google-fit/steps")
def get_steps():
    """Retrieve step count data from Google Fit"""
    access_token = GOOGLE_TOKENS.get("access_token")
    logger.debug(f"Retrieving steps with token: {bool(access_token)}")
    
    if not access_token:
        logger.warning("Google Fit not connected - no access token available")
        return {"error": "Google Fit not connected"}
    
    data = fetch_steps(access_token)
    return data
