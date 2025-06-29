// src/components/ProtectedRoute.jsx
import { useAuthStore } from "@/auth/useAuthStore";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" />;
  if (roles.length > 0 && !roles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return children;
};
