const API_BASE_URL = "http://127.0.0.1:8000";

export async function signupUser(data: {
  email: string;
  password: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Signup failed");
  }

  return result;
}
export async function loginUser(email: string, password: string) {
  const response = await fetch("http://127.0.0.1:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data; // { message, user_id }
}
export async function addPhysicalHealthData(data: {
  user_id: number;
  heart_rate: number;
  bp_sys: number;
  bp_dia: number;
  steps: number;
  calories_burned: number;
  temperature: number;
}) {
  const response = await fetch(`${API_BASE_URL}/physical-health`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || "Failed to save physical health data");
  }
  return result;
}
export async function addMentalHealthData(data: {
  user_id: number;
  mood_score: number;
  stress_level: number;
  anxiety_level: number;

  energy_level: number;
  notes?: string;
}) {
  const response = await fetch("http://127.0.0.1:8000/mental-health", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || "Failed to save mental health data");
  }
  return result;
}
