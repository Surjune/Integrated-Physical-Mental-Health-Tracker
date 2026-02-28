import React from "react";

/**
 * Health metrics with optional values
 * All fields are optional and default to undefined if not provided
 */
interface HealthMetrics {
  avg_heart_rate?: number | null;
  avg_steps?: number | null;
  avg_sleep_duration?: number | null;
  avg_stress?: number | null;
  avg_mood?: number | null;
}

interface WellnessCardProps {
  score: number | null | undefined;
  status: string | null | undefined;
  metrics?: HealthMetrics | null;
  isLoading?: boolean;
  insights?: string[] | null;
  recommendations?: string[] | null;
}

const WellnessCard: React.FC<WellnessCardProps> = ({ 
  score = null, 
  status = null, 
  metrics = null,
  isLoading = false,
  insights = null,
  recommendations = null
}) => {
  // Ensure metrics is always an object to prevent undefined access errors
  const safeMetrics: HealthMetrics = metrics || {};
  
  // Safe score value with fallback
  const safeScore = score ?? 0;
  const safeStatus = status ?? "Unknown";
  
  // Render loading state
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContent}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading your wellness data...</p>
        </div>
      </div>
    );
  }
  
  // Render empty state if no valid data
  if (!metrics || Object.keys(metrics).length === 0 || !score) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyStateContent}>
          <div style={styles.emptyStateIcon}>📊</div>
          <h3 style={styles.emptyStateTitle}>No Data Yet</h3>
          <p style={styles.emptyStateMessage}>
            Log your health data or connect Google Fit to see your wellness insights.
          </p>
        </div>
      </div>
    );
  }
  // Safe getter functions for status colors with null checks
  const getStatusColor = (s: string | null | undefined): string => {
    if (!s) return "#6b7280";
    if (s === "Excellent") return "#10b981";
    if (s === "Good") return "#3b82f6";
    if (s === "Moderate") return "#f59e0b";
    if (s === "Fair") return "#ef4444";
    if (s === "Critical") return "#dc2626";
    return "#6b7280";
  };

  const getStatusBgColor = (s: string | null | undefined): string => {
    if (!s) return "#f3f4f6";
    if (s === "Excellent") return "#d1fae5";
    if (s === "Good") return "#dbeafe";
    if (s === "Moderate") return "#fef3c7";
    if (s === "Fair") return "#fee2e2";
    if (s === "Critical") return "#fee2e2";
    return "#f3f4f6";
  };

  const statusColor = getStatusColor(safeStatus);
  const statusBgColor = getStatusBgColor(safeStatus);

  // Safe circle calculation with bounds checking
  const circumference = 2 * Math.PI * 45;
  const normalizedScore = Math.min(Math.max(safeScore, 0), 100);
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Top Section: Score and Status */}
        <div style={styles.scoreSection}>
          <div style={styles.circleContainer}>
            <svg width="150" height="150" style={styles.svg}>
              {/* Glow effect */}
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Background circle */}
              <circle
                cx="75"
                cy="75"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress circle with glow */}
              <circle
                cx="75"
                cy="75"
                r="45"
                fill="none"
                stroke={statusColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={styles.progressCircle}
                filter="url(#glow)"
              />
            </svg>
            <div style={styles.scoreText}>
              <div style={styles.scoreNumber}>{Math.round(normalizedScore)}</div>
              <div style={styles.scoreLabel}>/ 100</div>
            </div>
          </div>

          <div style={styles.statusSection}>
            <div style={{ ...styles.statusBadge, backgroundColor: statusBgColor, borderColor: statusColor }}>
              <div style={{ color: statusColor, fontWeight: "700" }}>{safeStatus}</div>
            </div>
            <p style={styles.statusDescription}>Overall Health Status</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>❤️ Heart Rate</div>
            <div style={styles.metricValue}>
              {safeMetrics?.avg_heart_rate != null ? `${Math.round(safeMetrics.avg_heart_rate)} bpm` : "N/A"}
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>👟 Daily Steps</div>
            <div style={styles.metricValue}>
              {safeMetrics?.avg_steps != null ? `${Math.round(safeMetrics.avg_steps).toLocaleString()}` : "N/A"}
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>😴 Sleep Duration</div>
            <div style={styles.metricValue}>
              {safeMetrics?.avg_sleep_duration != null ? `${(safeMetrics.avg_sleep_duration).toFixed(1)} hrs` : "N/A"}
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>😌 Stress Level</div>
            <div style={styles.metricValue}>
              {safeMetrics?.avg_stress != null ? `${Math.round(safeMetrics.avg_stress)}/10` : "N/A"}
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>😊 Mood Score</div>
            <div style={styles.metricValue}>
              {safeMetrics?.avg_mood != null ? `${Math.round(safeMetrics.avg_mood)}/10` : "N/A"}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider}></div>

        {/* Insights and Recommendations Section */}
        {(insights?.length || recommendations?.length) && (
          <div style={styles.insightsRecommendationsContainer}>
            {/* Insights */}
            {insights && insights.length > 0 && (
              <div style={styles.insightsSection}>
                <h3 style={styles.subsectionTitle}>🔍 Key Insights</h3>
                <div style={styles.insightsList}>
                  {insights.map((insight, idx) => (
                    <div key={idx} style={styles.insightItem}>
                      <div style={styles.insightDot}></div>
                      <p style={styles.insightText}>{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div style={styles.recommendationsSection}>
                <h3 style={styles.subsectionTitle}>💡 Recommendations</h3>
                <div style={styles.recommendationsList}>
                  {recommendations.map((rec, idx) => (
                    <div key={idx} style={styles.recommendationCard}>
                      <div style={styles.recommendationCardContent}>
                        <p style={styles.recommendationText}>{rec}</p>
                      </div>
                      <div style={styles.recommendationArrow}>→</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


const styles: { [key: string]: React.CSSProperties } = {
  container: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 118, 110, 0.4) 100%)",
    backdropFilter: "blur(25px)",
    borderRadius: "24px",
    padding: "32px",
    marginBottom: "16px",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.15)",
    animation: "fadeInUp 0.6s ease-out 0.3s both",
    minHeight: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    width: "100%",
    textAlign: "center",
  },
  loadingSpinner: {
    width: "48px",
    height: "48px",
    border: "4px solid rgba(148, 163, 184, 0.3)",
    borderTopColor: "#06b6d4",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "16px",
    color: "#cbd5e1",
    fontWeight: "500",
    margin: "0",
    letterSpacing: "0.3px",
  },
  emptyStateContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    width: "100%",
    textAlign: "center",
    padding: "40px 20px",
  },
  emptyStateIcon: {
    fontSize: "64px",
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#cbd5e1",
    margin: "0 0 12px 0",
  },
  emptyStateMessage: {
    fontSize: "15px",
    color: "#94a3b8",
    margin: "0",
    maxWidth: "400px",
    lineHeight: "1.6",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
  },
  scoreSection: {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "48px",
  width: "100%",
  minHeight: "200px",
},
circleContainer: {
  position: "relative",
  width: "180px",
  height: "180px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  },
  svg: {
    transform: "rotate(-90deg)",
    filter: "drop-shadow(0 10px 30px rgba(6, 182, 212, 0.2))",
  },
  progressCircle: {
    transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease",
  },
  scoreText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
  },
  scoreNumber: {
    fontSize: "48px",
    fontWeight: "900",
    background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  scoreLabel: {
    fontSize: "14px",
    color: "#94a3b8",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
statusSection: {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "180px", 
  },
  statusBadge: {
      display: "inline-flex",
    padding: "12px 24px",
    borderRadius: "32px",
    border: "2px solid",
    marginBottom: "12px",
    backdropFilter: "blur(10px)",
    background: "rgba(255, 255, 255, 0.05)",
    fontWeight: "700",
    fontSize: "15px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    alignItems: "center",
  justifyContent: "center",


  },
  statusDescription: {
    fontSize: "15px",
    color: "#cbd5e1",
    margin: "0",
    fontWeight: "500",
    opacity: 0.9,
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
  },
  metricCard: {
    background: "linear-gradient(135deg, rgba(100, 116, 139, 0.2) 0%, rgba(30, 41, 59, 0.4) 100%)",
    backdropFilter: "blur(10px)",
    borderRadius: "14px",
    padding: "16px",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    textAlign: "center",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
  },
  metricLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: "8px",
    letterSpacing: "0.3px",
  },
  metricValue: {
    fontSize: "16px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  divider: {
    height: "1px",
    background: "linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.2) 50%, transparent 100%)",
    margin: "12px 0",
  },
  insightsRecommendationsContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    width: "100%",
  },
  insightsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "linear-gradient(135deg, rgba(100, 116, 139, 0.08) 0%, rgba(30, 41, 59, 0.12) 100%)",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid rgba(148, 163, 184, 0.1)",
  },
  subsectionTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#e2e8f0",
    margin: "0 0 12px 0",
    letterSpacing: "0.5px",
  },
  insightsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  insightItem: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
  },
  insightDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
    marginTop: "6px",
    flexShrink: 0,
    boxShadow: "0 0 8px rgba(6, 182, 212, 0.5)",
  },
  insightText: {
    fontSize: "13px",
    color: "#cbd5e1",
    margin: "0",
    lineHeight: "1.4",
    fontWeight: "500",
  },
  recommendationsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "linear-gradient(135deg, rgba(100, 116, 139, 0.08) 0%, rgba(30, 41, 59, 0.12) 100%)",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid rgba(148, 163, 184, 0.1)",
  },
  recommendationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  recommendationCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(135deg, rgba(100, 116, 139, 0.12) 0%, rgba(30, 41, 59, 0.2) 100%)",
    backdropFilter: "blur(8px)",
    borderRadius: "10px",
    padding: "12px 14px",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
  },
  recommendationCardContent: {
    flex: 1,
  },
  recommendationText: {
    fontSize: "12px",
    color: "#cbd5e1",
    margin: "0",
    lineHeight: "1.4",
    fontWeight: "500",
  },
  recommendationArrow: {
    fontSize: "14px",
    color: "#06b6d4",
    marginLeft: "10px",
    fontWeight: "700",
    transition: "transform 0.3s ease",
  },
};

// Add CSS for interactive effects and animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
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

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  [style*="metricCard"]:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border-color: rgba(6, 182, 212, 0.4);
    background: linear-gradient(135deg, rgba(100, 116, 139, 0.3) 0%, rgba(30, 41, 59, 0.5) 100%);
  }

  [style*="recommendationCard"]:hover {
    transform: translateX(2px) scale(1.01);
    background: linear-gradient(135deg, rgba(100, 116, 139, 0.2) 0%, rgba(30, 41, 59, 0.35) 100%);
    border-color: rgba(6, 182, 212, 0.5);
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  [style*="recommendationCard"]:hover [style*="recommendationArrow"] {
    transform: translateX(2px);
  }

  @keyframes scoreGlow {
    0%, 100% {
      filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.4));
    }
    50% {
      filter: drop-shadow(0 0 16px rgba(6, 182, 212, 0.6));
    }
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    [style*="insightsRecommendationsContainer"] {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    [style*="metricsGrid"] {
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    }

    [style*="scoreSection"] {
      flex-direction: column;
      gap: 24px;
    }
  }

  @media (max-width: 480px) {
    [style*="metricsGrid"] {
      grid-template-columns: repeat(2, 1fr);
    }

    [style*="chartCard"] {
      min-width: 100%;
    }
  }
`;
if (!document.head.querySelector('style[data-wellness-card]')) {
  styleSheet.setAttribute('data-wellness-card', 'true');
  document.head.appendChild(styleSheet);
}

export default WellnessCard;
