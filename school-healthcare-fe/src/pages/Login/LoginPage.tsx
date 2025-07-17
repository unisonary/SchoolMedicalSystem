import { useState } from "react";
import { Heart, Stethoscope, Activity, FileText, Eye, EyeOff, Shield, Users, BarChart3 } from "lucide-react";
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
      
      if (res.isFirstLogin) {
        navigate("/first-login-change");
      } else {
        navigate(`/${res.user.role.toLowerCase()}/dashboard`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 animate-pulse">
          <Stethoscope className="w-32 h-32 text-white" />
        </div>
        <div className="absolute top-40 right-32 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <Activity className="w-40 h-40 text-white" />
        </div>
        <div className="absolute bottom-32 left-40 animate-pulse" style={{ animationDelay: '1s' }}>
          <FileText className="w-36 h-36 text-white" />
        </div>
        <div className="absolute bottom-20 right-20 animate-pulse" style={{ animationDelay: '1.5s' }}>
          <Heart className="w-48 h-48 text-white" />
        </div>
        <div className="absolute top-1/2 left-1/4">
          <div className="w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="absolute bottom-1/3 right-1/4">
          <div className="w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute top-1/4 right-1/3">
          <div className="w-56 h-56 bg-indigo-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <Heart className="w-12 h-12 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Hệ thống Quản lý
            </h1>
            <p className="text-xl text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text font-bold mb-4">
              Y tế Học đường
            </p>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
              Hệ thống quản lý y tế học đường hiện đại, an toàn và hiệu quả cho mọi người dùng
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tên đăng nhập hoặc Email
              </label>
              <input
                type="text"
                name="usernameOrEmail"
                placeholder="Nhập tên đăng nhập hoặc email"
                required
                value={formData.usernameOrEmail}
                onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none hover:border-gray-300 transition-all duration-200 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none hover:border-gray-300 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Đang đăng nhập...
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Đăng nhập
                </span>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all duration-200 text-sm px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Quên mật khẩu?
              </button>
            </div>
          </form>

          {/* Enhanced Features */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center group">
                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Theo dõi</p>
                <p className="text-xs text-gray-500">Sức khỏe</p>
              </div>
              <div className="text-center group">
                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Hồ sơ</p>
                <p className="text-xs text-gray-500">Điện tử</p>
              </div>
              <div className="text-center group">
                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Báo cáo</p>
                <p className="text-xs text-gray-500">Thống kê</p>
              </div>
            </div>
          </div>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Được bảo mật bởi Jolibee Group</span>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default LoginPage;