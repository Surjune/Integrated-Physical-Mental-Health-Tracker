"""
Google Fit OAuth Integration Module
Handles OAuth authentication and Google Fit API interactions
"""

import requests
import logging
from typing import Dict, Any
from config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI

logger = logging.getLogger(__name__)

# Global token storage (in production, use database or secure token storage)
GOOGLE_TOKENS: Dict[str, str] = {}

# Google OAuth endpoints
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_FIT_API_URL = "https://www.googleapis.com/fitness/v1/users/me"


def exchange_code_for_token(code: str) -> Dict[str, Any]:
    """
    Exchange OAuth authorization code for access token.
    
    Args:
        code: Authorization code from Google OAuth callback
    
    Returns:
        Dictionary containing access_token, refresh_token, expires_in, etc.
    """
    try:
        payload = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        
        response = requests.post(GOOGLE_TOKEN_URL, data=payload)
        response.raise_for_status()
        
        token_data = response.json()
        logger.info("✅ Successfully exchanged code for access token")
        return token_data
    
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Failed to exchange code for token: {str(e)}")
        raise


def save_tokens(token_data: Dict[str, str]) -> None:
    """
    Save tokens to global storage.
    
    In production, tokens should be:
    - Encrypted
    - Stored in database with user association
    - Refreshed using refresh_token before expiry
    
    Args:
        token_data: Dictionary containing access_token, refresh_token, expires_in, etc.
    """
    global GOOGLE_TOKENS
    GOOGLE_TOKENS.update({
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token"),
        "expires_in": token_data.get("expires_in"),
        "token_type": token_data.get("token_type", "Bearer"),
        "scope": token_data.get("scope"),
    })
    logger.info("✅ Tokens saved successfully")


def refresh_access_token(refresh_token: str) -> Dict[str, Any]:
    """
    Refresh access token using refresh token.
    
    Args:
        refresh_token: Refresh token from previous authentication
    
    Returns:
        Dictionary containing new access_token and expiry info
    """
    try:
        payload = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }
        
        response = requests.post(GOOGLE_TOKEN_URL, data=payload)
        response.raise_for_status()
        
        token_data = response.json()
        logger.info("✅ Access token refreshed successfully")
        return token_data
    
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Failed to refresh access token: {str(e)}")
        raise


def fetch_steps(access_token: str, days: int = 7) -> Dict[str, Any]:
    """
    Fetch step count data from Google Fit.
    
    Args:
        access_token: Google OAuth access token
        days: Number of days of data to retrieve (default: 7)
    
    Returns:
        Dictionary containing step data and statistics
    """
    try:
        import time
        from datetime import datetime, timedelta
        
        # Calculate time range
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)
        
        # Convert to milliseconds (Google Fit uses milliseconds)
        start_ms = int(start_time.timestamp() * 1000)
        end_ms = int(end_time.timestamp() * 1000)
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # Request body for Google Fit API
        payload = {
            "aggregateBy": [{
                "dataTypeName": "com.google.step_count.delta",
                "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
            }],
            "bucketByTime": {
                "durationMillis": 86400000  # 1 day in milliseconds
            },
            "startTimeMillis": start_ms,
            "endTimeMillis": end_ms
        }
        
        response = requests.post(
            f"{GOOGLE_FIT_API_URL}/dataset:aggregate",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        
        data = response.json()
        logger.info(f"✅ Retrieved step data for past {days} days from Google Fit")
        
        # Process and return data
        return {
            "steps_data": data.get("bucket", []),
            "period_days": days,
            "retrieved_at": end_time.isoformat()
        }
    
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Failed to fetch steps from Google Fit: {str(e)}")
        return {"error": str(e)}


def get_authorization_url() -> str:
    """
    Generate Google OAuth authorization URL.
    
    Returns:
        URL for user to click to authorize the application
    """
    from urllib.parse import urlencode
    
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join([
            "https://www.googleapis.com/auth/fitness.activity.read",
            "https://www.googleapis.com/auth/fitness.body.read",
            "openid email profile"
        ]),
        "access_type": "offline",
        "prompt": "consent"
    }
    
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


def is_connected() -> bool:
    """
    Check if Google Fit is currently connected (access token available).
    
    Returns:
        Boolean indicating if access token exists
    """
    return bool(GOOGLE_TOKENS.get("access_token"))
