import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Integrated Physical & Mental Health Tracker</h1>
        <p style={styles.subtitle}>No demo data. Real health insights.</p>
        <p style={styles.description}>
          Track your physical fitness, mental wellness, and daily activities all in one place. 
          Connect with Google Fit and monitor your health journey.
        </p>

        <Link to="/signin" style={{ textDecoration: "none" }}>
          <button style={styles.ctaButton}>Get Started</button>
        </Link>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "24px",
  },
  content: {
    textAlign: "center",
    maxWidth: "600px",
  },
  title: {
    fontSize: "48px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "16px",
    lineHeight: "1.2",
  },
  subtitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#3b82f6",
    marginBottom: "24px",
  },
  description: {
    fontSize: "16px",
    color: "#6b7280",
    lineHeight: "1.6",
    marginBottom: "40px",
  },
  ctaButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "14px 40px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
};
