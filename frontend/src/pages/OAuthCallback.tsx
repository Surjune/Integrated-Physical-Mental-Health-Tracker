import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        // Check for OAuth errors
        const errorParam = searchParams.get("error");
        if (errorParam) {
          setError(`OAuth error: ${errorParam}`);
          setLoading(false);
          return;
        }

        if (!code) {
          setError("No authorization code received");
          setLoading(false);
          return;
        }

        // Exchange code for token on backend
        const response = await fetch("http://localhost:8000/google-fit/connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error("Failed to connect Google Fit");
        }

        const data = await response.json();

        if (data.status === "connected") {
          // Successfully connected - redirect to dashboard
          const userId = localStorage.getItem("user_id");
          if (userId) {
            navigate("/dashboard");
          } else {
            navigate("/signin");
          }
        } else {
          setError("Failed to establish connection with Google Fit");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {loading ? (
          <>
            <div style={styles.spinner} />
            <p style={styles.text}>Connecting to Google Fit...</p>
            <p style={styles.subtext}>Please wait while we complete the authentication process.</p>
          </>
        ) : error ? (
          <>
            <p style={styles.errorText}>❌ {error}</p>
            <button
              style={styles.button}
              onClick={() => window.location.href = "/dashboard"}
            >
              Back to Dashboard
            </button>
          </>
        ) : null}
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
  card: {
    textAlign: "center",
    backgroundColor: "white",
    padding: "48px 24px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    maxWidth: "400px",
    width: "100%",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 24px",
  },
  text: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px",
  },
  subtext: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "20px",
  },
  errorText: {
    fontSize: "16px",
    color: "#dc2626",
    marginBottom: "24px",
  },
  button: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};
