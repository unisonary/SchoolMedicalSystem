// src/pages/Login/LoginPage.tsx
import { useState } from "react";
import { Heart, Stethoscope, Activity, FileText, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/auth/useAuthStore";
import { login } from "@/api/authApi";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20">
          <Stethoscope className="w-32 h-32 text-white" />
        </div>
        <div className="absolute top-40 right-32">
          <Activity className="w-40 h-40 text-white" />
        </div>
        <div className="absolute bottom-32 left-40">
          <FileText className="w-36 h-36 text-white" />
        </div>
        <div className="absolute bottom-20 right-20">
          <Heart className="w-48 h-48 text-white" />
        </div>
        <div className="absolute top-1/2 left-1/4">
          <div className="w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-1/3 right-1/4">
          <div className="w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Hệ thống Quản lý</h1>
            <p className="text-lg text-gray-600 font-medium mb-4">Y tế Học đường</p>
            <p className="text-sm text-gray-500">Hệ thống quản lý y tế học đường hiện đại, an toàn và hiệu quả</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập hoặc Email
              </label>
              <input
                type="text"
                name="usernameOrEmail"
                placeholder="Nhập tên đăng nhập hoặc email"
                required
                value={formData.usernameOrEmail}
                onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none hover:border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none hover:border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang đăng nhập...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200 text-sm"
              >
                Quên mật khẩu?
              </button>
            </div>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-600">Theo dõi sức khỏe</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-600">Hồ sơ điện tử</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-600">Báo cáo thống kê</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-white/80 text-sm">
          © 2024 Hệ thống Quản lý Y tế Học đường
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
