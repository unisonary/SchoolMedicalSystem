// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuthStore } from "@/auth/useAuthStore";
import LoginPage from "@/pages/Login/LoginPage";
import ForgotPasswordPage from "@/pages/Login/ForgotPasswordPage";
import ProtectedRouteByRole from "@/auth/ProtectedRouteByRole";
import "react-toastify/dist/ReactToastify.css";
import ParentDashboard from "@/pages/Parent/ParentDashboard"; // ✅ đường dẫn thật
import UserProfile from "./pages/Profile/UserProfile";
import ChangePasswordPage from "./pages/Login/ChangePasswordPage";
import NurseDashboard from "./pages/Nurse/NurseDashboard";
import ManagerDashboard from "./pages/Manager/ManagerDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import FirstLoginChangePage from "./pages/Login/FirstLoginChangePage";
import StudentDashboard from "./pages/Student/StudentDashboard";


// Dummy dashboard components (sau có thể import thật)
// const StudentDashboard = () => <div>Trang Học sinh</div>;
// const NurseDashboard = () => <div>Trang Y tá</div>;
// const ManagerDashboard = () => <div>Trang Quản lý</div>;
// const AdminDashboard = () => <div>Trang Admin</div>;

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <BrowserRouter>
      <Routes>
        {/* Trang login và quên mật khẩu */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage onBack={() => window.history.back()} />}
        />

        {/* Redirect từ "/" về dashboard nếu đã login */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={`/${user.role.toLowerCase()}/dashboard`} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Dashboard theo role */}
        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRouteByRole role="Parent">
              <ParentDashboard />
            </ProtectedRouteByRole>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRouteByRole role="Student">
              <StudentDashboard />
            </ProtectedRouteByRole>
          }
        />
        <Route
          path="/nurse/dashboard"
          element={
            <ProtectedRouteByRole role="Nurse">
              <NurseDashboard />
            </ProtectedRouteByRole>
          }
        />
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRouteByRole role="Manager">
              <ManagerDashboard/>
            </ProtectedRouteByRole>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRouteByRole role="Admin">
              <AdminDashboard/>
            </ProtectedRouteByRole>
          }
        />
        <Route path="/student/profile" element={<UserProfile />} />

        <Route path="/parent/profile" element={<UserProfile />} />

        <Route path="/nurse/profile" element={<UserProfile />} />

        <Route path="/manager/profile" element={<UserProfile />} />

        <Route path="/admin/profile" element={<UserProfile />} />



        <Route path="/login/change-password" element={<ChangePasswordPage />} />

        <Route path="/first-login-change" element={<FirstLoginChangePage />} />

        
        {/* Route không tồn tại → chuyển về login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
