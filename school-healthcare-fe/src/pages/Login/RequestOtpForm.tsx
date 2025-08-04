import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { sendOtp } from "@/api/authApi";
import { toast } from "react-toastify";


const RequestOtpForm = ({ onNext }: { onNext: (email: string) => void }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      await sendOtp(email);
      toast.success("Mã OTP đã được gửi đến email của bạn!");
      onNext(email);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Icon and Description */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Mail className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nhập địa chỉ email</h3>
          <p className="text-gray-600 leading-relaxed">
            Chúng tôi sẽ gửi mã xác thực đến địa chỉ email của bạn để khôi phục mật khẩu
          </p>
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Địa chỉ Email
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none" 
            placeholder="example@email.com" 
            required 
          />
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        disabled={loading || !email}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Đang gửi OTP...
          </div>
        ) : (
          <div className="flex items-center">
            <Send className="w-5 h-5 mr-2" />
            Gửi mã xác thực
          </div>
        )}
      </button>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Vui lòng kiểm tra cả hộp thư spam nếu không thấy email
        </p>
      </div>
    </form>
  );
};

export default RequestOtpForm;
