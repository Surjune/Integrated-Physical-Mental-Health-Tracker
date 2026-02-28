import { useEffect, useState } from "react";
import PhysicalHealthForm from "../components/PhysicalHealthForm";
import MentalHealthForm from "../components/MentalHealthForm";
import WellnessCard from "../components/WellnessCard";
import Chart from "../components/Chart";

interface HealthSummary {
  wellness_score: number;
  status: string;
  insights: string[];
  recommendations: string[];
  chart_data: {
    sleep_trend: { date: string; value: number }[];
    stress_trend: { date: string; value: number }[];
    activity_trend: { date: string; value: number }[];
    mood_trend: { date: string; value: number }[];
  };
  metrics: {
    avg_heart_rate?: number;
    avg_steps?: number;
    avg_sleep_duration?: number;
    avg_stress?: number;
    avg_mood?: number;
  };
}

export default function Dashboard() {
  const [healthSummary, setHealthSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPhysicalForm, setShowPhysicalForm] = useState(false);
  const [showMentalForm, setShowMentalForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch health summary
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    
    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`http://localhost:8000/health-summary/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch health summary");
        return res.json();
      })
      .then((data) => {
        setHealthSummary(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching health summary:", err);
        setError("Unable to load health summary. Please ensure you have health data logged.");
        setLoading(false);
      });
  }, [refreshTrigger]);

  const handleFormSubmit = () => {
    // Refresh health summary after form submission
    setRefreshTrigger((prev) => prev + 1);
  };

  // Google Fit OAuth
  const connectGoogleFit = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = "http://localhost:3000/oauth/callback";
    const scope = encodeURIComponent(
      "https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.sleep.read"
    );

    const authUrl =
      "https://accounts.google.com/o/oauth2/v2/auth" +
      `?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      "&response_type=code" +
      "&access_type=offline" +
      "&prompt=consent" +
      `&scope=${scope}`;

    window.location.href = authUrl;
  };

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        {/* Premium Header */}
        <div style={styles.header}>
          <h1 style={styles.heading}>✨ Health Dashboard</h1>
          <p style={styles.subheading}>Your personalized health intelligence and wellness insights</p>
        </div>

        {/* Premium Action Bar */}
        <div style={styles.actionBar}>
          <button style={styles.buttonPrimary} onClick={connectGoogleFit}>
            📱 Connect Google Fit
          </button>

          <button
            style={styles.buttonSecondary}
            onClick={() => {
              setShowPhysicalForm(!showPhysicalForm);
              setShowMentalForm(false);
            }}
          >
            ❤️ Log Physical Health
          </button>

          <button
            style={styles.buttonSecondary}
            onClick={() => {
              setShowMentalForm(!showMentalForm);
              setShowPhysicalForm(false);
            }}
          >
            🧠 Log Mental Health
          </button>

          <button
            style={styles.buttonRefresh}
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Form Sections */}
        {showPhysicalForm && <PhysicalHealthForm onSubmit={handleFormSubmit} />}
        {showMentalForm && <MentalHealthForm onSubmit={handleFormSubmit} />}

        {/* Loading State - Premium */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading your health intelligence...</p>
          </div>
        )}

        {/* Error State - Premium */}
        {error && (
          <div style={styles.errorBox}>
            <div style={styles.errorIcon}>⚠️</div>
            <div style={styles.errorContent}>
              <h3 style={styles.errorTitle}>No Data Available Yet</h3>
              <p style={styles.errorMessage}>{error}</p>
              <p style={styles.errorHint}>Get started by logging health data or connecting Google Fit to see your wellness insights.</p>
            </div>
          </div>
        )}

        {/* Health Summary Content - Premium */}
        {!loading && healthSummary && !error && (
          <>
            {/* Overall Wellness Card - Premium Unified Section */}
            <section style={styles.section}>
              <div style={{ animation: "slideIn 0.6s ease-out 0.2s both" }}>
                <WellnessCard
                  score={healthSummary?.wellness_score ?? null}
                  status={healthSummary?.status ?? null}
                  metrics={healthSummary?.metrics ?? null}
                  isLoading={loading}
                  insights={healthSummary?.insights ?? null}
                  recommendations={healthSummary?.recommendations ?? null}
                />
              </div>
            </section>

            {/* Trend Analysis Section */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>💹 Health Trends</h2>
              <div style={styles.chartsGrid}>
                {healthSummary.chart_data.sleep_trend.length > 0 && (
                  <div style={{ ...styles.chartCard, ...{ animationDelay: "0.2s" } }} className="chart-0">
                    <h3 style={styles.chartTitle}>Sleep Duration</h3>
                    <Chart
                      data={healthSummary.chart_data.sleep_trend}
                      label="Hours"
                      type="line"
                      color="#8b5cf6"
                    />
                  </div>
                )}

                {healthSummary.chart_data.stress_trend.length > 0 && (
                  <div style={{ ...styles.chartCard, ...{ animationDelay: "0.3s" } }} className="chart-1">
                    <h3 style={styles.chartTitle}>Stress Level</h3>
                    <Chart
                      data={healthSummary.chart_data.stress_trend}
                      label="Stress (0-10)"
                      type="line"
                      color="#f59e0b"
                    />
                  </div>
                )}

                {healthSummary.chart_data.activity_trend.length > 0 && (
                  <div style={{ ...styles.chartCard, ...{ animationDelay: "0.4s" } }} className="chart-2">
                    <h3 style={styles.chartTitle}>Daily Activity</h3>
                    <Chart
                      data={healthSummary.chart_data.activity_trend}
                      label="Steps"
                      type="bar"
                      color="#10b981"
                    />
                  </div>
                )}

                {healthSummary.chart_data.mood_trend.length > 0 && (
                  <div style={{ ...styles.chartCard, ...{ animationDelay: "0.5s" } }} className="chart-3">
                    <h3 style={styles.chartTitle}>Mood Score</h3>
                    <Chart
                      data={healthSummary.chart_data.mood_trend}
                      label="Mood (0-10)"
                      type="line"
                      color="#ec4899"
                    />
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f766e 100%)",
    minHeight: "100vh",
    padding: "16px",
    position: "relative",
    overflow: "hidden",
  },
  innerContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    padding: "32px 32px 24px 32px",
    marginBottom: "16px",
    textAlign: "center",
    animation: "fadeInDown 0.6s ease-out",
  },
  heading: {
    fontSize: "48px",
    fontWeight: "900",
    margin: "0 0 12px 0",
    background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #6366f1 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.5px",
  },
  subheading: {
    fontSize: "16px",
    color: "#cbd5e1",
    margin: "0",
    fontWeight: "400",
    letterSpacing: "0.3px",
  },
  actionBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "24px",
    justifyContent: "center",
    padding: "0 32px",
    animation: "fadeInUp 0.6s ease-out 0.1s both",
  },
  buttonPrimary: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    border: "none",
    padding: "12px 28px",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 8px 16px rgba(16, 185, 129, 0.25)",
    position: "relative",
    overflow: "hidden",
  },
  buttonSecondary: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    padding: "12px 28px",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 8px 16px rgba(59, 130, 246, 0.25)",
    position: "relative",
    overflow: "hidden",
  },
  buttonRefresh: {
    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    color: "white",
    border: "none",
    padding: "12px 28px",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 8px 16px rgba(139, 92, 246, 0.25)",
    position: "relative",
    overflow: "hidden",
  },
  section: {
    marginBottom: "24px",
    padding: "0 32px",
  },
  sectionTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#f1f5f9",
    marginBottom: "16px",
    paddingBottom: "0",
    borderBottom: "none",
    letterSpacing: "-0.5px",
    opacity: 0,
    animation: "fadeInLeft 0.6s ease-out forwards",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
    gap: "16px",
    marginTop: "16px",
  },
  chartCard: {
    background: "rgba(30, 41, 59, 0.6)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: 0,
    animation: "fadeInUp 0.6s ease-out forwards",
  },
  chartTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#cbd5e1",
    marginBottom: "16px",
    margin: "0 0 16px 0",
    letterSpacing: "0.2px",
    textTransform: "uppercase",
    opacity: 0.9,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "120px 24px",
    gap: "24px",
    minHeight: "60vh",
  },
  spinner: {
    width: "60px",
    height: "60px",
    border: "4px solid rgba(148, 163, 184, 0.2)",
    borderTopColor: "#06b6d4",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "16px",
    color: "#cbd5e1",
    fontWeight: "500",
    opacity: 0.8,
  },
  errorBox: {
    background: "rgba(220, 38, 38, 0.1)",
    backdropFilter: "blur(10px)",
    border: "2px solid rgba(220, 38, 38, 0.3)",
    borderRadius: "16px",
    padding: "32px",
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    marginBottom: "32px",
    margin: "32px",
    animation: "fadeInDown 0.6s ease-out",
  },
  errorIcon: {
    fontSize: "48px",
    minWidth: "60px",
    textAlign: "center",
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#fca5a5",
    margin: "0 0 8px 0",
  },
  errorMessage: {
    fontSize: "14px",
    color: "#fecaca",
    margin: "0 0 8px 0",
  },
  errorHint: {
    fontSize: "13px",
    color: "#fcb0b0",
    fontStyle: "italic",
    margin: "0",
    opacity: 0.8,
  },
};

// Add comprehensive CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  * {
    box-sizing: border-box;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scaleY(0.9);
    }
    to {
      opacity: 1;
      transform: scaleY(1);
    }
  }

  body {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f766e 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    color: #cbd5e1;
  }

  button {
    position: relative;
  }

  button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  button:active::before {
    width: 300px;
    height: 300px;
  }

  button:hover {
    transform: translateY(-2px);
    filter: brightness(1.05);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3) !important;
  }

  ${Array.from({ length: 10 }, (_, i) => `
    .chart-${i} {
      animation: fadeInUp 0.6s ease-out ${0.1 + i * 0.1}s both;
    }
  `).join('')}
`;
document.head.appendChild(styleSheet);

