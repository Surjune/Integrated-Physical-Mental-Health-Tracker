# Integrated Physical Mental Health Tracker

A comprehensive health tracking application that combines physical fitness data with mental health monitoring. Track your daily activities, workouts, and emotional wellness in one unified platform.

## Key Features

- OAuth Authentication with Google Sign-In
- Health Dashboard with personalized insights and metrics
- Physical tracking: activities, workouts, heart rate, body metrics
- Mental tracking: mood, stress, anxiety, energy levels
- Wellness score and health status analytics
- 14-day trend visualization charts
- AI-based suggestions for wellness improvements

## Tech Stack

- Frontend: React 18 + TypeScript, Vite, React Router
- Backend: FastAPI, SQLAlchemy, SQLite, Pydantic
- Data sources: Google Fit API / Google OAuth

## Repository Structure

```
integrated-physical-mental-health-tracker/
+-- frontend/
¦   +-- src/
¦   ¦   +-- components/
¦   ¦   ¦   +-- Chart.tsx
¦   ¦   ¦   +-- WellnessCard.tsx
¦   ¦   ¦   +-- PhysicalHealthForm.tsx
¦   ¦   ¦   +-- MentalHealthForm.tsx
¦   ¦   ¦   +-- ProtectedRoute.tsx
¦   ¦   ¦   +-- auth/
¦   ¦   +-- pages/
¦   ¦   ¦   +-- Dashboard.tsx
¦   ¦   ¦   +-- SignIn.tsx
¦   ¦   ¦   +-- Home.tsx
¦   ¦   ¦   +-- OAuthCallback.tsx
¦   ¦   +-- services/api.ts
¦   ¦   +-- types/health.ts
¦   ¦   +-- App.tsx
¦   ¦   +-- main.tsx
¦   +-- package.json
¦   +-- vite.config.ts
+-- backend/
¦   +-- main.py
¦   +-- routes.py
¦   +-- database.py
¦   +-- health_analytics.py
¦   +-- config.py
¦   +-- security.py
¦   +-- health_data.db
¦   +-- requirements.txt
+-- README.md
```

## Requirements

- Node.js 16+ / npm
- Python 3.8+

## Backend Setup

1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload`

Backend defaults to `http://localhost:8000`.

## Frontend Setup

1. `cd frontend`
2. `npm install`
3. `npm run dev`

Frontend defaults to `http://localhost:5173`.

## Production Build

- Frontend: `cd frontend && npm run build`
- Backend: deploy via Docker or your ASGI host of choice

## Usage

1. Sign in with Google
2. Grant Google Fit permissions (if configured)
3. Track physical activity and mental wellness
4. Review dashboard insights and trends

## Contributing

1. Fork repo, create feature branch
2. Commit with clear messages
3. Push and open PR

## License

MIT License

---

*Last updated: March 2026*
