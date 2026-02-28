import os
from dotenv import load_dotenv

# Explicitly load .env from the backend directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(dotenv_path=ENV_PATH)

# App config (fallback defaults included)
APP_NAME = os.getenv("APP_NAME", "Integrated Health Tracker")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./health_data.db")

# Google OAuth config
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
