import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  const effective = token || localStorage.getItem("token");
  return effective ? children : <Navigate to="/login" replace />;
}
