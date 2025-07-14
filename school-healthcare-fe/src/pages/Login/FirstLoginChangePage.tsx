// src/pages/Login/FirstLoginChangePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

const FirstLoginChangePage = () => {
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field: "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/auth/first-login-change-password", {
        newPassword: form.newPassword,
      });

      toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Đổi mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(form.newPassword);
  const getStrengthColor = (s: number) =>
    s < 2 ? "bg-red-500" : s < 4 ? "bg-yellow-500" : "bg-green-500";
  const getStrengthText = (s: number) =>
    s < 2 ? "Yếu" : s < 4 ? "Trung bình" : "Mạnh";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-cyan-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl border border-blue-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <Lock className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Đổi mật khẩu lần đầu</h1>
            <p className="text-gray-600 text-sm">Bạn cần đổi mật khẩu trước khi tiếp tục sử dụng hệ thống.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                required
                value={form.newPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.newPassword && (
              <div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Độ mạnh mật khẩu:</span>
                  <span className={strength < 2 ? "text-red-600" : strength < 4 ? "text-yellow-600" : "text-green-600"}>{getStrengthText(strength)}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className={`h-2 rounded-full ${getStrengthColor(strength)}`} style={{ width: `${(strength / 5) * 100}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className={`w-full border rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                  form.confirmPassword && form.newPassword !== form.confirmPassword
                    ? "border-red-300 focus:border-red-500"
                    : form.confirmPassword && form.newPassword === form.confirmPassword
                    ? "border-green-300 focus:border-green-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="Nhập lại mật khẩu"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {form.confirmPassword && form.newPassword === form.confirmPassword && (
                <CheckCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />
              )}
            </div>
            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="text-sm text-red-600">Mật khẩu xác nhận không khớp</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || form.newPassword !== form.confirmPassword}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Xác nhận và đăng xuất"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FirstLoginChangePage;
