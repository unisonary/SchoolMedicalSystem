import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/api/authApi";
import { toast } from "react-toastify";

interface ResetPasswordFormProps {
  email: string;
  otp: string;
  onSuccess: () => void;
  onBack: () => void;
}

const ResetPasswordForm = ({ email, otp, onSuccess, onBack }: ResetPasswordFormProps) => {
  const [passwords, setPasswords] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength <= 2) return { level: "weak", color: "red", text: "Yếu" };
    if (strength <= 3) return { level: "medium", color: "yellow", text: "Trung bình" };
    if (strength <= 4) return { level: "good", color: "blue", text: "Tốt" };
    return { level: "strong", color: "green", text: "Mạnh" };
  };

  const passwordStrength = getPasswordStrength(passwords.password);
  const passwordsMatch = passwords.password && passwords.confirmPassword && passwords.password === passwords.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const isStrongPassword = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(passwords.password);
    if (!isStrongPassword) {
      toast.error("Mật khẩu phải ≥8 ký tự, có chữ in hoa và ký tự đặc biệt.");
      return;
    }
  
    if (passwords.password !== passwords.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
  
    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword: passwords.password });
      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => onSuccess(), 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Lỗi đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Icon and Description */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Lock className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Đặt lại mật khẩu</h3>
          <p className="text-gray-600 leading-relaxed">
            Tạo mật khẩu mới an toàn cho tài khoản của bạn
          </p>
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Mật khẩu mới
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Nhập mật khẩu mới" 
            className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
            value={passwords.password} 
            onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} 
            required 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {passwords.password && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Độ mạnh mật khẩu:</span>
              <span className={`font-semibold text-${passwordStrength.color}-600`}>
                {passwordStrength.text}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`bg-${passwordStrength.color}-500 h-2 rounded-full transition-all duration-300`}
                style={{ width: `${(getPasswordStrength(passwords.password).level === 'weak' ? 20 : 
                  getPasswordStrength(passwords.password).level === 'medium' ? 40 :
                  getPasswordStrength(passwords.password).level === 'good' ? 70 : 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Xác nhận mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            placeholder="Nhập lại mật khẩu mới" 
            className={`w-full pl-12 pr-14 py-4 border-2 rounded-xl text-lg transition-all duration-200 outline-none ${
              passwords.confirmPassword 
                ? passwordsMatch 
                  ? "border-green-500 focus:ring-2 focus:ring-green-200" 
                  : "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            }`}
            value={passwords.confirmPassword} 
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} 
            required 
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Password Match Indicator */}
        {passwords.confirmPassword && (
          <div className="flex items-center mt-2">
            {passwordsMatch ? (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Mật khẩu khớp
              </div>
            ) : (
              <div className="text-red-600 text-sm">
                Mật khẩu không khớp
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        disabled={loading || !passwords.password || !passwords.confirmPassword || !passwordsMatch}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Đang cập nhật...
          </div>
        ) : (
          "Đặt lại mật khẩu"
        )}
      </button>

      {/* Password Requirements */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Yêu cầu mật khẩu:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className={`flex items-center ${passwords.password.length >= 8 ? 'text-green-600' : ''}`}>
            <span className="w-4 h-4 mr-2">
              {passwords.password.length >= 8 ? '✓' : '•'}
            </span>
            Ít nhất 8 ký tự
          </li>
          <li className={`flex items-center ${/[A-Z]/.test(passwords.password) ? 'text-green-600' : ''}`}>
            <span className="w-4 h-4 mr-2">
              {/[A-Z]/.test(passwords.password) ? '✓' : '•'}
            </span>
            Có chữ hoa
          </li>
          <li className={`flex items-center ${/[0-9]/.test(passwords.password) ? 'text-green-600' : ''}`}>
            <span className="w-4 h-4 mr-2">
              {/[0-9]/.test(passwords.password) ? '✓' : '•'}
            </span>
            Có số
          </li>
        </ul>
      </div>

      {/* Back Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 font-medium hover:underline transition-colors duration-200 flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại xác thực OTP
        </button>
      </div>
    </form>
  );
}

export default ResetPasswordForm;