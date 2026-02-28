from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional
import logging
from datetime import datetime

from security import hash_password, verify_password
from health_analytics import generate_health_summary, store_wellness_data
from database import get_db, PhysicalHealth, MentalHealth, SleepData, WellnessScore, InsightLog, User

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])
health_router = APIRouter(tags=["Physical Health"])


class PhysicalHealthRequest(BaseModel):
    user_id: int
    heart_rate: int
    bp_sys: int
    bp_dia: int
    steps: int
    calories_burned: float
    temperature: float


@health_router.post("/physical-health")
def add_physical_health(data: PhysicalHealthRequest, db: Session = Depends(get_db)):
    """
    Store physical health data and calculate wellness metrics.
    Properly persists data to database using SQLAlchemy.
    """
    try:
        # Create physical health record
        physical_record = PhysicalHealth(
            user_id=data.user_id,
            heart_rate=data.heart_rate,
            blood_pressure_systolic=data.bp_sys,
            blood_pressure_diastolic=data.bp_dia,
            steps=data.steps,
            calories_burned=data.calories_burned,
            body_temperature=data.temperature
        )
        
        db.add(physical_record)
        db.flush()  # Flush to get ID before full commit
        
        logger.info(f"✅ Stored physical health data for user {data.user_id}")
        
        # Calculate and store wellness data
        store_wellness_data(user_id=data.user_id, db=db, data_type="physical")
        
        db.commit()
        
        return {
            "message": "Physical health data saved successfully",
            "record_id": physical_record.id,
            "user_id": data.user_id
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving physical health data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save physical health data: {str(e)}"
        )


class MentalHealthRequest(BaseModel):
    user_id: int
    mood_score: int
    stress_level: int
    anxiety_level: int
    energy_level: int
    sleep_quality: Optional[int] = None


@health_router.post("/mental-health")
def add_mental_health(data: MentalHealthRequest, db: Session = Depends(get_db)):
    """
    Store mental health data and calculate wellness metrics.
    Also stores sleep quality if provided.
    """
    try:
        # Create mental health record
        mental_record = MentalHealth(
            user_id=data.user_id,
            mood_score=data.mood_score,
            stress_level=data.stress_level,
            anxiety_level=data.anxiety_level,
            energy_level=data.energy_level
        )
        
        db.add(mental_record)
        db.flush()
        
        # Store sleep quality if provided (1-10 scale)
        if data.sleep_quality is not None:
            sleep_record = SleepData(
                user_id=data.user_id,
                sleep_quality=data.sleep_quality
            )
            db.add(sleep_record)
            db.flush()
            logger.info(f"✅ Stored sleep quality data for user {data.user_id}")
        
        logger.info(f"✅ Stored mental health data for user {data.user_id}")
        
        # Calculate and store wellness data
        store_wellness_data(user_id=data.user_id, db=db, data_type="mental")
        
        db.commit()
        
        return {
            "message": "Mental health data saved successfully",
            "record_id": mental_record.id,
            "user_id": data.user_id
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving mental health data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save mental health data: {str(e)}"
        )


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user account"""
    logger.debug(f"Signup request received: {data.email}")
    
    try:
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == data.email).first()
        if existing_user:
            logger.warning(f"Signup failed: Email already exists - {data.email}")
            raise HTTPException(status_code=400, detail="Email already exists")

        # Create new user
        new_user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            age=data.age,
            gender=data.gender,
            height_cm=data.height_cm,
            weight_kg=data.weight_kg
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"✅ Signup successful for user: {new_user.id}")

        return {
            "message": "Signup successful",
            "user_id": new_user.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return user ID"""
    logger.debug(f"Login request received for email: {data.email}")
    
    try:
        user = db.query(User).filter(User.email == data.email).first()

        if not user:
            logger.warning(f"Login failed: User not found - {data.email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not verify_password(data.password, user.password_hash):
            logger.warning(f"Login failed: Invalid password - {data.email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")

        logger.info(f"✅ Login successful for user: {user.id}")

        return {
            "message": "Login successful",
            "user_id": user.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# GET Endpoints for Health Data Retrieval
# ==========================================

@health_router.get("/physical-health/{user_id}")
def get_physical_health(user_id: int, db: Session = Depends(get_db)):
    """Retrieve latest physical health data for a user"""
    logger.debug(f"Fetching physical health data for user: {user_id}")
    
    try:
        records = db.query(PhysicalHealth).filter(
            PhysicalHealth.user_id == user_id
        ).order_by(PhysicalHealth.recorded_at.desc()).limit(10).all()
        
        if not records:
            logger.info(f"No physical health data found for user: {user_id}")
            return []
        
        data = []
        for record in records:
            data.append({
                "id": record.id,
                "user_id": record.user_id,
                "heart_rate": record.heart_rate,
                "bp_sys": record.blood_pressure_systolic,
                "bp_dia": record.blood_pressure_diastolic,
                "steps": record.steps,
                "calories_burned": record.calories_burned,
                "temperature": record.body_temperature,
                "recorded_at": record.recorded_at.isoformat() if record.recorded_at else None
            })
        
        return data
        
    except Exception as e:
        logger.error(f"Error fetching physical health data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@health_router.get("/mental-health/{user_id}")
def get_mental_health(user_id: int, db: Session = Depends(get_db)):
    """Retrieve latest mental health data for a user"""
    logger.debug(f"Fetching mental health data for user: {user_id}")
    
    try:
        records = db.query(MentalHealth).filter(
            MentalHealth.user_id == user_id
        ).order_by(MentalHealth.recorded_at.desc()).limit(10).all()
        
        if not records:
            logger.info(f"No mental health data found for user: {user_id}")
            return []
        
        data = []
        for record in records:
            data.append({
                "id": record.id,
                "user_id": record.user_id,
                "mood_score": record.mood_score,
                "stress_level": record.stress_level,
                "anxiety_level": record.anxiety_level,
                "energy_level": record.energy_level,
                "recorded_at": record.recorded_at.isoformat() if record.recorded_at else None
            })
        
        return data
        
    except Exception as e:
        logger.error(f"Error fetching mental health data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# Health Summary & Analytics
# ==========================================

@health_router.get("/health-summary/{user_id}")
def get_health_summary(user_id: int, db: Session = Depends(get_db)):
    """
    Generate comprehensive health summary including:
    - Wellness score (0-100)
    - Health status
    - Generated insights
    - Personalized recommendations
    - Chart data for visualization
    """
    logger.info(f"Generating health summary for user: {user_id}")
    
    try:
        summary = generate_health_summary(user_id, db)
        logger.info(f"✅ Health summary generated successfully for user: {user_id}")
        return summary
        
    except Exception as e:
        logger.error(f"Error generating health summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate health summary: {str(e)}"
        )