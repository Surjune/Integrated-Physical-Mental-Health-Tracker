import { useState } from "react";
import { addMentalHealthData } from "../services/api";

interface MentalHealthFormProps {
  onSubmit?: () => void;
}

const MentalHealthForm = ({ onSubmit }: MentalHealthFormProps) => {
  const userId = localStorage.getItem("user_id");

  const [form, setForm] = useState({
    mood_score: "",
    stress_level: "",
    anxiety_level: "",
    energy_level: "",
    sleep_quality: ""
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

    // Validate inputs
    const requiredFields = ["mood_score", "stress_level", "anxiety_level", "energy_level"];
    const emptyFields: string[] = [];
    
    for (const key of requiredFields) {
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
      await addMentalHealthData({
          user_id: Number(userId),
          mood_score: Number(form.mood_score),
          stress_level: Number(form.stress_level),
          anxiety_level: Number(form.anxiety_level),
          energy_level: Number(form.energy_level),
      });

      setSuccess(true);
      setForm({
        mood_score: "",
        stress_level: "",
        anxiety_level: "",
        energy_level: "",
        sleep_quality: ""
      });

      // Show success message for 3 seconds
      setTimeout(() => setSuccess(false), 3000);

      // Call the callback to refresh dashboard
      if (onSubmit) {
        onSubmit();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save mental health data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.cardContainer}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.formTitle}>🧠 Mental Wellness Check-In</h2>
        <p style={styles.formDescription}>
          Track your emotional wellbeing and mental state for holistic health insights
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div style={styles.successBox}>
          <div style={styles.successIcon}>✓</div>
          <p style={styles.successText}>Mental health data saved successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={styles.errorBox}>
          <div style={styles.errorIcon}>⚠️</div>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {/* Mood & Emotion Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>😊 Mood & Emotions</h3>
        <div style={styles.sectionGrid} data-mental-form-grid>
          <div style={styles.formGroup}>
            <label style={styles.label}>Mood Score <span style={styles.required}>*</span></label>
            <div style={styles.sliderWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(focusedField === "mood_score" ? styles.inputFocused : {})
                }}
                name="mood_score"
                type="number"
                min="1"
                max="10"
                placeholder="1-10"
                value={form.mood_score}
                onChange={handleChange}
                onFocus={() => handleFocus("mood_score")}
                onBlur={handleBlur}
              />
              <span style={styles.scaleHint}>{form.mood_score && `${form.mood_score}/10`}</span>
            </div>
            <p style={styles.fieldHelper}>1 = Very sad, 10 = Extremely happy</p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Stress Level <span style={styles.required}>*</span></label>
            <div style={styles.sliderWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(focusedField === "stress_level" ? styles.inputFocused : {})
                }}
                name="stress_level"
                type="number"
                min="1"
                max="10"
                placeholder="1-10"
                value={form.stress_level}
                onChange={handleChange}
                onFocus={() => handleFocus("stress_level")}
                onBlur={handleBlur}
              />
              <span style={styles.scaleHint}>{form.stress_level && `${form.stress_level}/10`}</span>
            </div>
            <p style={styles.fieldHelper}>1 = No stress, 10 = Very stressed</p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Anxiety Level <span style={styles.required}>*</span></label>
            <div style={styles.sliderWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(focusedField === "anxiety_level" ? styles.inputFocused : {})
                }}
                name="anxiety_level"
                type="number"
                min="1"
                max="10"
                placeholder="1-10"
                value={form.anxiety_level}
                onChange={handleChange}
                onFocus={() => handleFocus("anxiety_level")}
                onBlur={handleBlur}
              />
              <span style={styles.scaleHint}>{form.anxiety_level && `${form.anxiety_level}/10`}</span>
            </div>
            <p style={styles.fieldHelper}>1 = No anxiety, 10 = Severe anxiety</p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Energy Level <span style={styles.required}>*</span></label>
            <div style={styles.sliderWrapper}>
              <input
                style={{
                  ...styles.input,
                  ...(focusedField === "energy_level" ? styles.inputFocused : {})
                }}
                name="energy_level"
                type="number"
                min="1"
                max="10"
                placeholder="1-10"
                value={form.energy_level}
                onChange={handleChange}
                onFocus={() => handleFocus("energy_level")}
                onBlur={handleBlur}
              />
              <span style={styles.scaleHint}>{form.energy_level && `${form.energy_level}/10`}</span>
            </div>
            <p style={styles.fieldHelper}>1 = Very tired, 10 = Full of energy</p>
          </div>
        </div>
      </div>

      {/* Sleep Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>😴 Sleep Quality</h3>
        <div style={styles.formGroup}>
          <label style={styles.label}>Sleep Quality (Optional)</label>
          <div style={styles.sliderWrapper}>
            <input
              style={{
                ...styles.input,
                ...(focusedField === "sleep_quality" ? styles.inputFocused : {})
              }}
              name="sleep_quality"
              type="number"
              min="1"
              max="10"
              placeholder="1-10"
              value={form.sleep_quality}
              onChange={handleChange}
              onFocus={() => handleFocus("sleep_quality")}
              onBlur={handleBlur}
            />
            <span style={styles.scaleHint}>{form.sleep_quality && `${form.sleep_quality}/10`}</span>
          </div>
          <p style={styles.fieldHelper}>Rate the quality of your sleep last night</p>
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
          "Save Mental Health Data"
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
    background: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
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
  sliderWrapper: {
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
    borderColor: "#ec4899",
    background: "rgba(15, 23, 42, 0.8)",
    boxShadow: "0 0 0 3px rgba(236, 72, 153, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
  },
  scaleHint: {
    position: "absolute",
    right: "12px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#ec4899",
    pointerEvents: "none",
    opacity: 0.8,
  },
  fieldHelper: {
    fontSize: "12px",
    color: "#64748b",
    margin: "0",
    fontWeight: "500",
    lineHeight: "1.4",
  },
  submitButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    background: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    color: "white",
    border: "none",
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "700",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 8px 24px rgba(236, 72, 153, 0.3)",
    marginTop: "24px",
    letterSpacing: "0.5px",
    width: "100%",
  },
  submitButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
    boxShadow: "0 4px 12px rgba(236, 72, 153, 0.2)",
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

  @media (max-width: 600px) {
    [data-mental-form-grid] {
      grid-template-columns: 1fr !important;
    }
  }
`;
if (!document.head.querySelector('style[data-mental-form]')) {
  styleSheet.setAttribute('data-mental-form', 'true');
  document.head.appendChild(styleSheet);
}

export default MentalHealthForm;
