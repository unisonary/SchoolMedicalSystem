import { useState } from "react";
import { toast } from "react-toastify";
import axios from "@/api/axiosInstance";
import { Lock, Eye, EyeOff, Shield, Key, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";

const ChangePasswordPage = () => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp.");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/auth/change-password", {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });

      toast.success("Đổi mật khẩu thành công!");
      navigate("/login");
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Đổi mật khẩu thất bại.";
      toast.error(message);
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

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return "bg-red-500";
    if (strength < 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 2) return "Yếu";
    if (strength < 4) return "Trung bình";
    return "Mạnh";
  };

  const strength = passwordStrength(form.newPassword);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 min-h-screen">
      <MainLayout>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Lock className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Đổi mật khẩu</h1>
                <p className="text-gray-600">Cập nhật mật khẩu để bảo mật tài khoản</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Key className="text-white" size={16} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Thông tin mật khẩu</h2>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.old ? "text" : "password"}
                        name="oldPassword"
                        required
                        value={form.oldPassword}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('old')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        required
                        value={form.newPassword}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {form.newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Độ mạnh mật khẩu:</span>
                          <span className={`text-xs font-medium ${
                            strength < 2 ? 'text-red-600' : strength < 4 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {getStrengthText(strength)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength)}`}
                            style={{ width: `${(strength / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        required
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className={`w-full border rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                          form.confirmPassword && form.newPassword !== form.confirmPassword
                            ? 'border-red-300 focus:border-red-500'
                            : form.confirmPassword && form.newPassword === form.confirmPassword
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

                  {/* Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={loading || form.newPassword !== form.confirmPassword}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang xử lý...</span>
                        </div>
                      ) : (
                        "Đổi mật khẩu"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Security Tips Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <Shield className="text-white" size={16} />
                  </div>
                  <h3 className="font-semibold text-gray-800">Bảo mật tài khoản</h3>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Không sử dụng thông tin cá nhân dễ đoán</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Thay đổi mật khẩu định kỳ</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Lock className="text-white" size={16} />
                  </div>
                  <h3 className="font-semibold text-gray-800">Lưu ý quan trọng</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Sau khi đổi mật khẩu thành công, bạn sẽ được chuyển về trang đăng nhập để đăng nhập lại với mật khẩu mới.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default ChangePasswordPage;