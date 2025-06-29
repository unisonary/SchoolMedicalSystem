// src/auth/ProtectedRouteByRole.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "./useAuthStore";
import { JSX } from "react";

interface ProtectedRouteByRoleProps {
  role: string;
  children: JSX.Element;
}

const ProtectedRouteByRole = ({ role, children }: ProtectedRouteByRoleProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    // ❌ Chưa đăng nhập → chuyển về login
    return <Navigate to="/login" />;
  }

  if (user.role !== role) {
    // ❌ Đăng nhập sai vai trò → chuyển về dashboard đúng
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} />;
  }

  // ✅ Đúng vai trò → cho phép truy cập
  return children;
};

export default ProtectedRouteByRole;
