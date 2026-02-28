# Integrated Physical Mental Health Tracker

A comprehensive health tracking application that combines physical fitness data with mental health monitoring. Track your daily activities, workouts, and mental wellness in one unified platform.

## Features

- **OAuth Authentication**: Secure Google sign-in
- **Health Dashboard**: View personalized wellness insights and metrics
- **Physical Health Tracking**: Log cardiovascular, activity, and body metrics
- **Mental Health Tracking**: Monitor mood, stress, anxiety, and energy levels
- **Wellness Analytics**: Automatic calculation of wellness score and health status
- **Trend Visualization**: Charts showing 14-day trends across all metrics
- **AI-Generated Insights**: Personalized insights and recommendations based on your data

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **React Router** for navigation
- **Inline styles** for simplicity

### Backend
- **FastAPI** with Python 3.8+
- **SQLAlchemy** for ORM
- **SQLite** for data persistence
- **Pydantic** for data validation

## Project Structure

```
integrated-physical-mental-health-tracker/
├── frontend/                          # React TypeScript app
│   ├── src/
│   │   ├── components/               # UI components
│   │   │   ├── Chart.tsx             # Trend visualization
│   │   │   ├── WellnessCard.tsx      # Main wellness display
│   │   │   ├── PhysicalHealthForm.tsx
│   │   │   ├── MentalHealthForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── auth/
│   │   ├── pages/                    # Application pages
│   │   │   ├── Dashboard.tsx         # Main app
│   │   │   ├── SignIn.tsx
│   │   │   ├── Home.tsx
│   │   │   └── OAuthCallback.tsx
│   │   ├── services/
│   │   │   └── api.ts                # API client
│   │   ├── types/
│   │   │   └── health.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                          # Python FastAPI
│   ├── main.py                       # App entry point
│   ├── routes.py                     # API endpoints
│   ├── database.py                   # ORM models
│   ├── health_analytics.py           # Wellness calculations
│   ├── config.py                     # Configuration
│   ├── security.py                   # Auth utilities
│   ├── health_data.db                # SQLite database
│   └── requirements.txt
│
└── README.md
```

## Getting Started

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- SQLite (included with Python)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd integrated-physical-mental-health-tracker
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

### Running the Application

1. **Start the Backend**
```bash
cd backend
uvicorn main:app --reload
```
Backend runs on `http://localhost:8000`

2. **Start the Frontend** (new terminal)
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

3. **Build for Production**
```bash
# Frontend
cd frontend && npm run build

# Backend: deploy via Docker/cloud provider with production ASGI server
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on the repository or contact the development team.

---

**Last Updated**: February 2026
*Build for Production**

Frontend:
```bash
cd frontend
npm run build
```

Backend:
```bash
cd backend
# Follow your deployment method
```

## API Integration

The application integrates with:
- **Google Fit API**: Fetches user fitness and activity data
- **Google OAuth**: Handles authentication
- **Backend API**: Custom endpoints for health insights and data processing

## Usage

1. Sign in with your Google account
2. Grant permissions for Google Fit data access
3. View your health dashboard with synced fitness data
4. Track mental health insights and trends
5. Explore analytics and health metrics

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on the repository or contact the development team.

--- 

**Last Updated**: February 2026
