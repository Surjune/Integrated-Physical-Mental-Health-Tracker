import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  element: React.ReactElement;
}

export default function ProtectedRoute({ element }: ProtectedRouteProps) {
  const userId = localStorage.getItem("user_id");

  if (!userId) {
    return <Navigate to="/signin" replace />;
  }

  return element;
}
