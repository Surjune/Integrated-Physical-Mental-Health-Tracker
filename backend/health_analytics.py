"""
Health Analytics Module
Generates wellness scores, insights, recommendations, and chart data
Uses SQLAlchemy for database operations
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import logging

logger = logging.getLogger(__name__)


def get_latest_records(user_id: int, db: Session, days: int = 30) -> Tuple[List, List, List]:
    """
    Fetch latest health records for specified user within last N days using SQLAlchemy.
    
    Returns:
        Tuple of (physical_health_records, mental_health_records, sleep_records)
    """
    from database import PhysicalHealth, MentalHealth, SleepData
    
    try:
        # Calculate date from N days ago
        date_threshold = datetime.utcnow() - timedelta(days=days)
        
        # Fetch physical health data
        physical_data = db.query(PhysicalHealth).filter(
            PhysicalHealth.user_id == user_id,
            PhysicalHealth.recorded_at >= date_threshold
        ).order_by(PhysicalHealth.recorded_at.desc()).all()
        
        # Fetch mental health data
        mental_data = db.query(MentalHealth).filter(
            MentalHealth.user_id == user_id,
            MentalHealth.recorded_at >= date_threshold
        ).order_by(MentalHealth.recorded_at.desc()).all()
        
        # Fetch sleep data - handles schema mismatches gracefully
        try:
            sleep_data = db.query(SleepData).filter(
                SleepData.user_id == user_id,
                SleepData.created_at >= date_threshold
            ).order_by(SleepData.created_at.desc()).all()
        except Exception as sleep_error:
            logger.warning(f"⚠️  Could not fetch sleep data: {str(sleep_error)}")
            logger.warning("💡 This usually means the database schema needs to be updated.")
            sleep_data = []
        
        return physical_data, mental_data, sleep_data
        
    except Exception as e:
        logger.error(f"❌ Error fetching health records: {str(e)}")
        logger.error("💡 Check that the database schema matches the ORM models")
        return [], [], []


def calculate_averages(physical_data: List, mental_data: List, sleep_data: List) -> Dict:
    """
    Calculate average metrics from health records.
    Now works with SQLAlchemy ORM objects.
    """
    averages = {
        "avg_heart_rate": None,
        "avg_blood_pressure_sys": None,
        "avg_blood_pressure_dia": None,
        "avg_steps": None,
        "avg_calories": None,
        "avg_temperature": None,
        "avg_mood": None,
        "avg_stress": None,
        "avg_anxiety": None,
        "avg_energy": None,
        "avg_sleep_duration": None,
        "avg_sleep_quality": None,
    }
    
    if physical_data:
        heart_rates = [r.heart_rate for r in physical_data if r.heart_rate is not None]
        bp_sys = [r.blood_pressure_systolic for r in physical_data if r.blood_pressure_systolic is not None]
        bp_dia = [r.blood_pressure_diastolic for r in physical_data if r.blood_pressure_diastolic is not None]
        steps = [r.steps for r in physical_data if r.steps is not None]
        calories = [r.calories_burned for r in physical_data if r.calories_burned is not None]
        temps = [r.body_temperature for r in physical_data if r.body_temperature is not None]
        
        averages["avg_heart_rate"] = sum(heart_rates) / len(heart_rates) if heart_rates else None
        averages["avg_blood_pressure_sys"] = sum(bp_sys) / len(bp_sys) if bp_sys else None
        averages["avg_blood_pressure_dia"] = sum(bp_dia) / len(bp_dia) if bp_dia else None
        averages["avg_steps"] = sum(steps) / len(steps) if steps else None
        averages["avg_calories"] = sum(calories) / len(calories) if calories else None
        averages["avg_temperature"] = sum(temps) / len(temps) if temps else None
    
    if mental_data:
        moods = [r.mood_score for r in mental_data if r.mood_score is not None]
        stress = [r.stress_level for r in mental_data if r.stress_level is not None]
        anxiety = [r.anxiety_level for r in mental_data if r.anxiety_level is not None]
        energy = [r.energy_level for r in mental_data if r.energy_level is not None]
        
        averages["avg_mood"] = sum(moods) / len(moods) if moods else None
        averages["avg_stress"] = sum(stress) / len(stress) if stress else None
        averages["avg_anxiety"] = sum(anxiety) / len(anxiety) if anxiety else None
        averages["avg_energy"] = sum(energy) / len(energy) if energy else None
    
    if sleep_data:
        durations = [r.sleep_duration_hours for r in sleep_data if r.sleep_duration_hours is not None]
        qualities = [r.sleep_quality for r in sleep_data if r.sleep_quality is not None]
        
        averages["avg_sleep_duration"] = sum(durations) / len(durations) if durations else None
        averages["avg_sleep_quality"] = sum(qualities) / len(qualities) if qualities else None
    
    return averages


def calculate_trends(physical_data: List, mental_data: List, sleep_data: List) -> Dict:
    """
    Calculate trend information (comparing recent vs older data).
    Works with SQLAlchemy ORM objects.
    """
    trends = {
        "steps_trend": 0,
        "stress_trend": 0,
        "mood_trend": 0,
        "sleep_duration_trend": 0,
    }
    
    # Steps trend (recent 7 days vs previous 7 days)
    if len(physical_data) >= 14:
        recent_steps = [r.steps for r in physical_data[:7] if r.steps is not None]
        older_steps = [r.steps for r in physical_data[7:14] if r.steps is not None]
        if recent_steps and older_steps:
            avg_recent = sum(recent_steps) / len(recent_steps)
            avg_older = sum(older_steps) / len(older_steps)
            trends["steps_trend"] = ((avg_recent - avg_older) / avg_older * 100) if avg_older > 0 else 0
    
    # Stress trend
    if len(mental_data) >= 14:
        recent_stress = [r.stress_level for r in mental_data[:7] if r.stress_level is not None]
        older_stress = [r.stress_level for r in mental_data[7:14] if r.stress_level is not None]
        if recent_stress and older_stress:
            avg_recent = sum(recent_stress) / len(recent_stress)
            avg_older = sum(older_stress) / len(older_stress)
            trends["stress_trend"] = ((avg_recent - avg_older) / avg_older * 100) if avg_older > 0 else 0
    
    # Mood trend
    if len(mental_data) >= 14:
        recent_mood = [r.mood_score for r in mental_data[:7] if r.mood_score is not None]
        older_mood = [r.mood_score for r in mental_data[7:14] if r.mood_score is not None]
        if recent_mood and older_mood:
            avg_recent = sum(recent_mood) / len(recent_mood)
            avg_older = sum(older_mood) / len(older_mood)
            trends["mood_trend"] = ((avg_recent - avg_older) / avg_older * 100) if avg_older > 0 else 0
    
    # Sleep duration trend
    if len(sleep_data) >= 14:
        recent_sleep = [r.sleep_duration_hours for r in sleep_data[:7] if r.sleep_duration_hours is not None]
        older_sleep = [r.sleep_duration_hours for r in sleep_data[7:14] if r.sleep_duration_hours is not None]
        if recent_sleep and older_sleep:
            avg_recent = sum(recent_sleep) / len(recent_sleep)
            avg_older = sum(older_sleep) / len(older_sleep)
            trends["sleep_duration_trend"] = ((avg_recent - avg_older) / avg_older * 100) if avg_older > 0 else 0
    
    return trends


def calculate_wellness_score(averages: Dict, trends: Dict) -> Tuple[int, str]:
    """
    Calculate overall wellness score (0-100) using weighted factors.
    
    Weights:
    - Sleep (30%)
    - Stress (25%)
    - Activity (20%)
    - Mood (15%)
    - Heart rate stability (10%)
    """
    components = {}
    
    # Sleep score (30%) - ideal is 7-8 hours
    if averages["avg_sleep_duration"]:
        sleep_hours = averages["avg_sleep_duration"]
        if 7 <= sleep_hours <= 8:
            components["sleep"] = 100
        elif 6 <= sleep_hours < 7:
            components["sleep"] = 80
        elif 8 < sleep_hours <= 9:
            components["sleep"] = 85
        elif sleep_hours < 6:
            components["sleep"] = 50
        else:
            components["sleep"] = 40
    else:
        components["sleep"] = 50  # Default if no data
    
    # Stress score (25%) - lower is better, scale is 0-10
    if averages["avg_stress"] is not None:
        stress = averages["avg_stress"]
        components["stress"] = max(0, 100 - (stress * 10))
    else:
        components["stress"] = 50
    
    # Activity score (20%) - steps per day, ideal is 8000+
    if averages["avg_steps"]:
        steps = averages["avg_steps"]
        if steps >= 8000:
            components["activity"] = 100
        elif steps >= 7000:
            components["activity"] = 85
        elif steps >= 5000:
            components["activity"] = 70
        else:
            components["activity"] = 40
    else:
        components["activity"] = 50
    
    # Mood score (15%) - scale is 0-10
    if averages["avg_mood"] is not None:
        mood = averages["avg_mood"]
        components["mood"] = min(100, (mood / 10) * 100)
    else:
        components["mood"] = 50
    
    # Heart rate stability (10%) - normal is 60-100 bpm, ideal is 60-80
    if averages["avg_heart_rate"]:
        hr = averages["avg_heart_rate"]
        if 60 <= hr <= 80:
            components["heart_rate"] = 100
        elif 55 <= hr < 60 or 80 < hr <= 100:
            components["heart_rate"] = 80
        elif 50 <= hr < 55 or 100 < hr <= 110:
            components["heart_rate"] = 60
        else:
            components["heart_rate"] = 40
    else:
        components["heart_rate"] = 50
    
    # Calculate weighted score
    weights = {
        "sleep": 0.30,
        "stress": 0.25,
        "activity": 0.20,
        "mood": 0.15,
        "heart_rate": 0.10
    }
    
    wellness_score = sum(components[key] * weights[key] for key in components)
    
    # Determine status
    if wellness_score >= 75:
        status = "Excellent"
    elif wellness_score >= 60:
        status = "Good"
    elif wellness_score >= 50:
        status = "Moderate"
    elif wellness_score >= 35:
        status = "Fair"
    else:
        status = "Critical"
    
    return int(wellness_score), status


def generate_insights(averages: Dict, trends: Dict) -> List[str]:
    """
    Generate intelligent insights based on health data.
    """
    insights = []
    
    # Sleep insights
    if averages["avg_sleep_duration"]:
        if averages["avg_sleep_duration"] < 6:
            insights.append("⚠️ Your sleep duration is consistently below 6 hours, which may impact your health.")
        elif averages["avg_sleep_duration"] > 9:
            insights.append("💤 You're sleeping more than average (9+ hours). Consider waking earlier if possible.")
    
    # Stress and sleep correlation
    if averages["avg_stress"] is not None and averages["avg_sleep_duration"]:
        if averages["avg_stress"] > 7 and averages["avg_sleep_duration"] < 6:
            insights.append("🔗 Stress spikes correlate with poor sleep. Try relaxation techniques before bed.")
    
    # Activity insights
    if averages["avg_steps"]:
        if averages["avg_steps"] < 5000:
            insights.append("📉 Physical activity is low. Aim for at least 7,000 steps per day.")
        elif trends["steps_trend"] < -20:
            insights.append("📉 Physical activity decreased by {:.0f}% this week.".format(abs(trends["steps_trend"])))
        elif trends["steps_trend"] > 20:
            insights.append("📈 Great! Physical activity increased by {:.0f}% this week!".format(trends["steps_trend"]))
    
    # Mood insights
    if averages["avg_mood"] is not None:
        if averages["avg_mood"] < 4:
            insights.append("😟 Your mood scores have been low recently. Consider talking to someone or seeking support.")
        elif trends["mood_trend"] > 20:
            insights.append("😊 Your mood has improved significantly recently!")
        elif trends["mood_trend"] < -20:
            insights.append("😔 Your mood has declined. Try activities that bring you joy.")
    
    # Heart rate insights
    if averages["avg_heart_rate"]:
        if averages["avg_heart_rate"] > 100:
            insights.append("💓 Your resting heart rate is elevated. Consider stress management techniques.")
        elif averages["avg_heart_rate"] < 55:
            insights.append("💓 Your resting heart rate is quite low. This is normal if you're athletic.")
    
    # Stress insights
    if averages["avg_stress"] is not None:
        if averages["avg_stress"] > 8:
            insights.append("🚨 Stress levels are high. Prioritize relaxation and self-care.")
        elif trends["stress_trend"] > 30:
            insights.append("📈 Stress has increased significantly. Take time for yourself.")
    
    return insights if insights else ["✅ Your health metrics look balanced. Keep maintaining good habits!"]


def generate_recommendations(averages: Dict, trends: Dict) -> List[str]:
    """
    Generate personalized health recommendations.
    """
    recommendations = []
    
    # Sleep recommendations
    if averages["avg_sleep_duration"]:
        if averages["avg_sleep_duration"] < 7:
            recommendations.append("🌙 Increase sleep to 7-8 hours. Try setting a consistent bedtime.")
        elif averages["avg_sleep_duration"] > 9:
            recommendations.append("⏰ Try reducing sleep time to 7-8 hours for optimal health.")
    else:
        recommendations.append("🌙 Start tracking your sleep to get personalized recommendations.")
    
    # Stress recommendations
    if averages["avg_stress"] is not None:
        if averages["avg_stress"] > 7:
            recommendations.append("😌 Try 15 minutes of meditation or deep breathing daily.")
        elif averages["avg_stress"] > 5:
            recommendations.append("🧘 Practice mindfulness: even 5 minutes helps reduce stress.")
    
    # Activity recommendations
    if averages["avg_steps"]:
        if averages["avg_steps"] < 7000:
            recommendations.append("🚶 Aim for 7,000-10,000 steps daily. Take short walks throughout the day.")
        else:
            recommendations.append("✅ Great activity level! Keep up with your exercise routine.")
    else:
        recommendations.append("👟 Start tracking your steps to improve accountability.")
    
    # Mood/Mental health recommendations
    if averages["avg_mood"] is not None:
        if averages["avg_mood"] < 5:
            recommendations.append("💬 Consider speaking with a mental health professional or trusted friend.")
    
    # General hydration and recovery
    recommendations.append("💧 Stay hydrated: drink at least 8 glasses of water daily.")
    recommendations.append("🏃 Balance cardio with strength training for optimal fitness.")
    
    return recommendations


def format_chart_data(physical_data: List, mental_data: List, sleep_data: List) -> Dict:
    """
    Format health data for charting using SQLAlchemy ORM objects.
    """
    # Sleep trend - last 14 days
    sleep_trend = []
    for record in reversed(sleep_data[-14:]):  # Last 14 days
        date_str = record.created_at.isoformat().split("T")[0] if record.created_at else ""
        sleep_trend.append({
            "date": date_str,
            "value": float(record.sleep_duration_hours) if record.sleep_duration_hours is not None else 0
        })
    
    # Stress trend - last 14 days
    stress_trend = []
    for record in reversed(mental_data[-14:]):  # Last 14 days
        date_str = record.recorded_at.isoformat().split("T")[0] if record.recorded_at else ""
        stress_trend.append({
            "date": date_str,
            "value": int(record.stress_level) if record.stress_level is not None else 0
        })
    
    # Activity trend (steps) - last 14 days
    activity_trend = []
    for record in reversed(physical_data[-14:]):  # Last 14 days
        date_str = record.recorded_at.isoformat().split("T")[0] if record.recorded_at else ""
        activity_trend.append({
            "date": date_str,
            "value": int(record.steps) if record.steps is not None else 0
        })
    
    # Mood trend - last 14 days
    mood_trend = []
    for record in reversed(mental_data[-14:]):  # Last 14 days
        date_str = record.recorded_at.isoformat().split("T")[0] if record.recorded_at else ""
        mood_trend.append({
            "date": date_str,
            "value": int(record.mood_score) if record.mood_score is not None else 0
        })
    
    return {
        "sleep_trend": sleep_trend,
        "stress_trend": stress_trend,
        "activity_trend": activity_trend,
        "mood_trend": mood_trend
    }


def generate_health_summary(user_id: int, db: Session) -> Dict[str, Any]:
    """
    Main function to generate complete health summary.
    
    Args:
        user_id: The user ID to generate summary for
        db: SQLAlchemy Session for database operations
    
    Returns:
        Dictionary containing wellness score, status, insights, recommendations, and chart data
    """
    try:
        # Fetch data using SQLAlchemy
        physical_data, mental_data, sleep_data = get_latest_records(user_id, db, days=30)
        
        # If no data, return default response
        if not physical_data and not mental_data and not sleep_data:
            logger.warning(f"No health data found for user {user_id}")
            return {
                "wellness_score": 0,
                "status": "Insufficient Data",
                "insights": ["No health data available. Start tracking your health!"],
                "recommendations": [
                    "📱 Log your physical health metrics daily",
                    "📊 Track your mental health and stress levels",
                    "😴 Record your sleep patterns"
                ],
                "chart_data": {
                    "sleep_trend": [],
                    "stress_trend": [],
                    "activity_trend": [],
                    "mood_trend": []
                }
            }
        
        # Calculate metrics
        averages = calculate_averages(physical_data, mental_data, sleep_data)
        trends = calculate_trends(physical_data, mental_data, sleep_data)
        wellness_score, status = calculate_wellness_score(averages, trends)
        insights = generate_insights(averages, trends)
        recommendations = generate_recommendations(averages, trends)
        chart_data = format_chart_data(physical_data, mental_data, sleep_data)
        
        return {
            "wellness_score": wellness_score,
            "status": status,
            "insights": insights,
            "recommendations": recommendations,
            "chart_data": chart_data,
            "metrics": {
                "avg_heart_rate": round(averages["avg_heart_rate"], 2) if averages["avg_heart_rate"] else None,
                "avg_steps": round(averages["avg_steps"], 0) if averages["avg_steps"] else None,
                "avg_sleep_duration": round(averages["avg_sleep_duration"], 2) if averages["avg_sleep_duration"] else None,
                "avg_stress": round(averages["avg_stress"], 2) if averages["avg_stress"] else None,
                "avg_mood": round(averages["avg_mood"], 2) if averages["avg_mood"] else None
            }
        }
    
    except Exception as e:
        logger.error(f"Error generating health summary for user {user_id}: {str(e)}")
        return {
            "wellness_score": 0,
            "status": "Error",
            "insights": ["An error occurred while generating your health summary"],
            "recommendations": ["Please try again later"],
            "chart_data": {}
        }


def store_wellness_data(user_id: int, db: Session, data_type: str = None) -> Dict[str, Any]:
    """
    Calculate wellness metrics from health data and persist to database.
    
    This function:
    1. Fetches latest health records for the user
    2. Calculates wellness score, status, insights, and recommendations
    3. Creates and stores WellnessScore record
    4. Creates and stores InsightLog records for each insight and recommendation
    5. Commits all changes to the database
    
    Args:
        user_id: The user ID to process
        db: SQLAlchemy Session for database operations
        data_type: Optional data type parameter (physical/mental/sleep)
    
    Returns:
        Dictionary with status and created record IDs
    """
    from database import WellnessScore, InsightLog
    
    try:
        # Fetch latest health data
        physical_data, mental_data, sleep_data = get_latest_records(user_id, db, days=30)
        
        # If no data available, skip wellness score generation
        if not physical_data and not mental_data and not sleep_data:
            logger.warning(f"No health data available for user {user_id} to store wellness data")
            return {
                "status": "no_data",
                "message": "No health data available to calculate wellness metrics"
            }
        
        # Calculate all metrics
        averages = calculate_averages(physical_data, mental_data, sleep_data)
        trends = calculate_trends(physical_data, mental_data, sleep_data)
        wellness_score, status = calculate_wellness_score(averages, trends)
        insights = generate_insights(averages, trends)
        recommendations = generate_recommendations(averages, trends)
        
        # Create WellnessScore record
        wellness_record = WellnessScore(
            user_id=user_id,
            wellness_score=wellness_score,
            status=status,
            created_at=datetime.utcnow()
        )
        db.add(wellness_record)
        
        # Create InsightLog records for each insight
        insight_log_ids = []
        for insight_text in insights:
            insight_record = InsightLog(
                user_id=user_id,
                insight_text=insight_text,
                recommendation_text=None,  # Insights don't have recommendation text
                created_at=datetime.utcnow()
            )
            db.add(insight_record)
            db.flush()  # Flush to get the ID
            insight_log_ids.append(insight_record.id)
        
        # Create InsightLog records for each recommendation
        recommendation_log_ids = []
        for recommendation_text in recommendations:
            recommendation_record = InsightLog(
                user_id=user_id,
                insight_text=None,  # Recommendations don't have insight text
                recommendation_text=recommendation_text,
                created_at=datetime.utcnow()
            )
            db.add(recommendation_record)
            db.flush()  # Flush to get the ID
            recommendation_log_ids.append(recommendation_record.id)
        
        # Commit all changes at once
        db.commit()
        
        logger.info(
            f"✅ Wellness data stored for user {user_id}: "
            f"score={wellness_score}, status={status}, "
            f"insights={len(insights)}, recommendations={len(recommendations)}"
        )
        
        return {
            "status": "success",
            "wellness_score": wellness_score,
            "wellness_status": status,
            "wellness_record_id": wellness_record.id,
            "insight_log_ids": insight_log_ids,
            "recommendation_log_ids": recommendation_log_ids
        }
    
    except Exception as e:
        db.rollback()  # Rollback on error
        logger.error(f"❌ Error storing wellness data for user {user_id}: {str(e)}", exc_info=True)
        return {
            "status": "error",
            "message": f"Error storing wellness data: {str(e)}"
        }
