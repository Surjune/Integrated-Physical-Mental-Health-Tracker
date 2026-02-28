
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser, loginUser  } from "../services/api";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const result = await signupUser({
        email: formData.email,
        password: formData.password,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender,
        height_cm: formData.height_cm ? Number(formData.height_cm) : undefined,
        weight_kg: formData.weight_kg ? Number(formData.weight_kg) : undefined,
      });

      localStorage.setItem("user_id", result.user_id.toString());
      setMessage("Signup successful ✅ Data stored in database");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const result = await loginUser(
        formData.email,
        formData.password
      );

      // ✅ THIS IS WHERE user_id IS STORED
      localStorage.setItem("user_id", result.user_id.toString());

      setMessage("Login successful ✅");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p style={styles.subtext}>
          {isLogin 
            ? "Log in to access your health dashboard" 
            : "Join us to start tracking your health"}
        </p>

        <form onSubmit={isLogin ? handleLogin : handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div style={styles.twoColumn}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Age</label>
                  <input
                    style={styles.input}
                    name="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Gender</label>
                  <input
                    style={styles.input}
                    name="gender"
                    placeholder="e.g., Male, Female"
                    value={formData.gender}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={styles.twoColumn}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Height (cm)</label>
                  <input
                    style={styles.input}
                    name="height_cm"
                    type="number"
                    placeholder="170"
                    value={formData.height_cm}
                    onChange={handleChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Weight (kg)</label>
                  <input
                    style={styles.input}
                    name="weight_kg"
                    type="number"
                    placeholder="70"
                    value={formData.weight_kg}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" style={styles.primaryButton}>
            {isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div style={styles.toggleAuth}>
          <p style={styles.toggleText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setMessage("");
                setFormData({ email: "", password: "", age: "", gender: "", height_cm: "", weight_kg: "" });
              }}
              style={styles.toggleButton}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>

        {error && <p style={styles.errorMessage}>{error}</p>}
        {message && <p style={styles.successMessage}>{message}</p>}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "24px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtext: {
    fontSize: "14px",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "32px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "24px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#1f2937",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    outline: "none",
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "12px 16px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "8px",
  },
  toggleAuth: {
    textAlign: "center",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
  toggleText: {
    fontSize: "14px",
    color: "#6b7280",
  },
  toggleButton: {
    background: "none",
    border: "none",
    color: "#3b82f6",
    cursor: "pointer",
    fontWeight: "600",
    marginLeft: "4px",
    fontSize: "14px",
    transition: "color 0.3s ease",
  },
  errorMessage: {
    color: "#dc2626",
    fontSize: "14px",
    padding: "12px",
    backgroundColor: "#fee2e2",
    borderRadius: "8px",
    marginTop: "16px",
    textAlign: "center",
  },
  successMessage: {
    color: "#059669",
    fontSize: "14px",
    padding: "12px",
    backgroundColor: "#d1fae5",
    borderRadius: "8px",
    marginTop: "16px",
    textAlign: "center",
  },
};

export default SignIn;
