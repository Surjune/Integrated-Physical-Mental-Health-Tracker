"""
SQLAlchemy Database Configuration and Models
Handles all database operations and ORM mapping
"""

from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, ForeignKey, Text, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import logging
from config import DATABASE_URL

logger = logging.getLogger(__name__)

# Create database engine
# SQLite database connection
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()


# ==========================================
# Database Models
# ==========================================

class User(Base):
    """User account information"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PhysicalHealth(Base):
    """Physical health metrics"""
    __tablename__ = "physical_health"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    heart_rate = Column(Integer)
    blood_pressure_systolic = Column(Integer)
    blood_pressure_diastolic = Column(Integer)
    steps = Column(Integer)
    calories_burned = Column(Float)
    body_temperature = Column(Float)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)


class MentalHealth(Base):
    """Mental health metrics"""
    __tablename__ = "mental_health"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mood_score = Column(Integer)  # 1-10
    stress_level = Column(Integer)  # 1-10
    anxiety_level = Column(Integer)  # 1-10
    energy_level = Column(Integer)  # 1-10
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)


class SleepData(Base):
    """Sleep tracking data"""
    __tablename__ = "sleep_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    sleep_duration_hours = Column(Float, nullable=True)  # Hours of sleep
    sleep_quality = Column(Integer, nullable=True)  # 1-10 rating
    bedtime = Column(DateTime, nullable=True)
    wake_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class WellnessScore(Base):
    """Calculated wellness scores over time"""
    __tablename__ = "wellness_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    wellness_score = Column(Integer)  # 0-100
    status = Column(String)  # Excellent, Good, Moderate, Fair, Critical
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class InsightLog(Base):
    """Generated insights and recommendations"""
    __tablename__ = "insights_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    insight_text = Column(Text)  # Individual insight
    recommendation_text = Column(Text, nullable=True)  # Individual recommendation
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


# Create all tables
def init_db():
    """
    Initialize database - create all tables.
    
    In development mode: Detects and fixes schema mismatches
    by dropping and recreating tables if needed.
    
    For production: Use Alembic for safe schema migrations.
    Reference: https://alembic.sqlalchemy.org/
    """
    try:
        # Try to create all tables (non-destructive for new tables)
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables ensured successfully")
        
        # Verify schema integrity for sleep_data table
        # (common issue when adding created_at column)
        try:
            # Test query to verify schema
            from sqlalchemy import inspect
            inspector = inspect(engine)
            sleep_columns = [col['name'] for col in inspector.get_columns('sleep_data')]
            
            if 'created_at' not in sleep_columns:
                logger.warning("⚠️  Schema mismatch detected: sleep_data.created_at missing")
                logger.warning("🔄 Recreating sleep_data table to fix schema...")
                
                # Drop and recreate table in development mode
                SleepData.__table__.drop(engine, checkfirst=True)
                SleepData.__table__.create(engine)
                
                logger.info("✅ sleep_data table recreated successfully")
        
        except Exception as schema_check_error:
            # If table doesn't exist yet, that's fine
            if "no such table" not in str(schema_check_error):
                logger.debug(f"Schema check info: {str(schema_check_error)}")
    
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")
        logger.error("Try deleting health_data.db and restarting the application")
        raise


# Dependency for FastAPI
def get_db():
    """Get database session for dependency injection"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Session management utilities
def commit_and_refresh(db: Session, obj):
    """Commit and refresh an object"""
    try:
        db.commit()
        db.refresh(obj)
        return obj
    except Exception as e:
        db.rollback()
        raise e
