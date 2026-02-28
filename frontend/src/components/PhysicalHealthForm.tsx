import { useState } from "react";
import { addPhysicalHealthData } from "../services/api";

interface PhysicalHealthFormProps {
  onSubmit?: () => void;
}

const PhysicalHealthForm = ({ onSubmit }: PhysicalHealthFormProps) => {
  const userId = localStorage.getItem("user_id");

  const [form, setForm] = useState({
    heart_rate: "",
    bp_sys: "",
    bp_dia: "",
    steps: "",
    calories_burned: "",
    temperature: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async () => {
    if (!userId) {
      setError("User not logged in");
      return;
    }

    // ✅ Validate: no empty fields
    const emptyFields: string[] = [];
    for (const key in form) {
      if (form[key as keyof typeof form] === "") {
        emptyFields.push(key.replace(/_/g, " "));
      }
    }

    if (emptyFields.length > 0) {
      setError(`Please fill: ${emptyFields.join(", ")}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addPhysicalHealthData({
        user_id: Number(userId),
        heart_rate: Number(form.heart_rate),
        bp_sys: Number(form.bp_sys),
        bp_dia: Number(form.bp_dia),
        steps: Number(form.steps),
        calories_burned: Number(form.calories_burned),
        temperature: Number(form.temperature)
      });

      setSuccess(true);
      setForm({
        heart_rate: "",
        bp_sys: "",
        bp_dia: "",
        steps: "",
        calories_burned: "",
        temperature: ""
      });

      // Show success message for 3 seconds
      setTimeout(() => setSuccess(false), 3000);

      // Call the callback to refresh dashboard
      if (onSubmit) {
        onSubmit();
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save physical health data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.cardContainer}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.formTitle}>❤️ Physical Health Check-In</h2>
        <p style={styles.formDescription}>
          Log your vitals and activity metrics for accurate health tracking
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div style={styles.successBox}>
          <div style={styles.successIcon}>✓</div>
          <p style={styles.successText}>Physical health data saved successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={styles.errorBox}>
          <div style={styles.errorIcon}>⚠️</div>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {/* Vitals Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📊 Vitals</h3>
        <div style={styles.sectionGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Heart Rate <span style={styles.required}>*</span></label>
            <div style={styles.inputWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(focusedField === "heart_rate" ? styles.inputFocused : {})
                }}
                name="heart_rate"
                type="number"
                placeholder="60-100"
                value={form.heart_rate}
                onChange={handleChange}
                onFocus={() => handleFocus("heart_rate")}
                onBlur={handleBlur}
              />
              <span style={styles.unitLabel}>bpm</span>
            </div>
            <p style={styles.fieldHelper}>Normal range: 60-100 beats per minute</p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Temperature <span style={styles.required}>*</span></label>
            <div style={styles.inputWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(focusedField === "temperature" ? styles.inputFocused : {})
                }}
                name="temperature"
                type="number"
                step="0.1"
                placeholder="36.5"
                value={form.temperature}
                onChange={handleChange}
                onFocus={() => handleFocus("temperature")}
                onBlur={handleBlur}
              />
              <span style={styles.unitLabel}>°C</span>
            </div>
            <p style={styles.fieldHelper}>Normal: 36.5-37.5°C</p>
          </div>
        </div>

        {/* Blood Pressure */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Blood Pressure <span style={styles.required}>*</span></label>
          <div style={styles.bpContainer}>
            <div style={{ flex: 1 }}>
              <div style={styles.inputWrapper}>
                <input
                  style={{
                    ...styles.input,
                    ...(focusedField === "bp_sys" ? styles.inputFocused : {})
                  }}
                  name="bp_sys"
                  type="number"
                  placeholder="120"
                  value={form.bp_sys}
                  onChange={handleChange}
                  onFocus={() => handleFocus("bp_sys")}
                  onBlur={handleBlur}
                />
              </div>
              <p style={styles.bpLabel}>Systolic</p>
            </div>
            <div style={styles.bpSeparator}>/</div>
            <div style={{ flex: 1 }}>
              <div style={styles.inputWrapper}>
                <input
                  style={{
                    ...styles.input,
                    ...(focusedField === "bp_dia" ? styles.inputFocused : {})
                  }}
                  name="bp_dia"
                  type="number"
                  placeholder="80"
                  value={form.bp_dia}
                  onChange={handleChange}
                  onFocus={() => handleFocus("bp_dia")}
                  onBlur={handleBlur}
                />
              </div>
              <p style={styles.bpLabel}>Diastolic</p>
            </div>
          </div>
          <p style={styles.fieldHelper}>Normal: 120/80 mmHg (Systolic/Diastolic)</p>
        </div>
      </div>

      {/* Activity Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🚴 Activity</h3>
        <div style={styles.sectionGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Daily Steps <span style={styles.required}>*</span></label>
            <div style={styles.inputWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(focusedField === "steps" ? styles.inputFocused : {})
                }}
                name="steps"
                type="number"
                placeholder="5000"
                value={form.steps}
                onChange={handleChange}
                onFocus={() => handleFocus("steps")}
                onBlur={handleBlur}
              />
              <span style={styles.unitLabel}>steps</span>
            </div>
            <p style={styles.fieldHelper}>Recommended: 8,000-10,000 steps daily</p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Calories Burned <span style={styles.required}>*</span></label>
            <div style={styles.inputWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(focusedField === "calories_burned" ? styles.inputFocused : {})
                }}
                name="calories_burned"
                type="number"
                placeholder="2000"
                value={form.calories_burned}
                onChange={handleChange}
                onFocus={() => handleFocus("calories_burned")}
                onBlur={handleBlur}
              />
              <span style={styles.unitLabel}>kcal</span>
            </div>
            <p style={styles.fieldHelper}>Total calories burned today</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        style={{
          ...styles.submitButton,
          ...(isLoading ? styles.submitButtonDisabled : {})
        }}
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span style={styles.spinner}></span>
            Saving...
          </>
        ) : (
          "Save Physical Health Data"
        )}
      </button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  cardContainer: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 118, 110, 0.4) 100%)",
    backdropFilter: "blur(25px)",
    borderRadius: "24px",
    padding: "48px",
    marginBottom: "32px",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.15)",
    animation: "fadeInUp 0.6s ease-out",
  },
  header: {
    marginBottom: "32px",
  },
  formTitle: {
    fontSize: "32px",
    fontWeight: "900",
    background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: "0 0 12px 0",
    letterSpacing: "-0.5px",
  },
  formDescription: {
    fontSize: "15px",
    color: "#cbd5e1",
    margin: "0",
    fontWeight: "400",
    letterSpacing: "0.3px",
    lineHeight: "1.6",
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: "12px",
    padding: "12px 16px",
    marginBottom: "24px",
    animation: "slideIn 0.4s ease-out",
  },
  successIcon: {
    fontSize: "20px",
    color: "#10b981",
    fontWeight: "700",
    display: "flex",
  },
  successText: {
    fontSize: "14px",
    color: "#10b981",
    margin: "0",
    fontWeight: "600",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "12px",
    padding: "12px 16px",
    marginBottom: "24px",
    animation: "slideIn 0.4s ease-out",
  },
  errorIcon: {
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
  },
  errorText: {
    fontSize: "14px",
    color: "#ef4444",
    margin: "0",
    fontWeight: "600",
  },
  section: {
    marginBottom: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#e2e8f0",
    margin: "0",
    letterSpacing: "0.5px",
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#cbd5e1",
    letterSpacing: "0.3px",
  },
  required: {
    color: "#ef4444",
    fontWeight: "700",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "12px 16px 12px 16px",
    border: "1.5px solid rgba(148, 163, 184, 0.3)",
    borderRadius: "12px",
    fontSize: "15px",
    color: "#e2e8f0",
    background: "rgba(15, 23, 42, 0.6)",
    fontFamily: "inherit",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
  },
  inputFocused: {
    borderColor: "#06b6d4",
    background: "rgba(15, 23, 42, 0.8)",
    boxShadow: "0 0 0 3px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
  },
  unitLabel: {
    position: "absolute",
    right: "12px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    pointerEvents: "none",
  },
  fieldHelper: {
    fontSize: "12px",
    color: "#64748b",
    margin: "0",
    fontWeight: "500",
    lineHeight: "1.4",
  },
  bpContainer: {
    display: "flex",
    alignItems: "flex-end",
    gap: "16px",
  },
  bpSeparator: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#06b6d4",
    marginBottom: "12px",
    opacity: 0.6,
  },
  bpLabel: {
    fontSize: "12px",
    color: "#64748b",
    margin: "6px 0 0 0",
    fontWeight: "600",
    textAlign: "center",
  },
  submitButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
    color: "white",
    border: "none",
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "700",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 8px 24px rgba(6, 182, 212, 0.3)",
    marginTop: "24px",
    letterSpacing: "0.5px",
    width: "100%",
  },
  submitButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
    boxShadow: "0 4px 12px rgba(6, 182, 212, 0.2)",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

// Add global animations
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

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  input::placeholder {
    color: rgba(148, 163, 184, 0.4);
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number] {
    -moz-appearance: textfield;
  }
`;
if (!document.head.querySelector('style[data-physical-form]')) {
  styleSheet.setAttribute('data-physical-form', 'true');
  document.head.appendChild(styleSheet);
}

export default PhysicalHealthForm;
