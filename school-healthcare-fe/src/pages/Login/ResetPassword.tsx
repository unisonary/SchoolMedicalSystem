import { useState } from "react";
import { Heart, Stethoscope, Activity, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/auth/useAuthStore";
import { login } from "@/api/authApi";
import { toast } from "react-toastify";
import ForgotPasswordPage from "./ForgotPasswordPage";

const LoginPage = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const setAuth = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(formData);
      setAuth(res);
      localStorage.setItem("token", res.user.token);
      toast.success("Đăng nhập thành công!");
      navigate(`/${res.user.role.toLowerCase()}/dashboard`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <ForgotPasswordPage onBack={() => setShowForgotPassword(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Hệ thống Quản lý Y tế Học đường</h1>
          </div>
          <input type="text" name="usernameOrEmail" placeholder="Tên đăng nhập hoặc Email" required
            value={formData.usernameOrEmail} onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4" />
          <input type="password" name="password" placeholder="Mật khẩu" required
            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4" />
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <div className="text-center mt-4">
            <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</button>
          </div>
        </form>
      </div>
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="p-8 max-w-lg">
          <div className="flex space-x-4 mb-6">
            <Stethoscope className="w-10 h-10" />
            <Activity className="w-10 h-10" />
            <FileText className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Chăm sóc sức khỏe học sinh</h2>
          <p className="mb-4">Hệ thống quản lý y tế học đường hiện đại, an toàn và hiệu quả</p>
          <ul className="space-y-2">
            <li>✔️ Theo dõi sức khỏe học sinh toàn diện</li>
            <li>✔️ Quản lý hồ sơ y tế điện tử</li>
            <li>✔️ Báo cáo và thống kê chi tiết</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
