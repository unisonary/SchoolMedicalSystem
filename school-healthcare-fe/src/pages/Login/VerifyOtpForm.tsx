import { useState, useRef, useEffect, useCallback  } from "react";
import { Shield, RotateCcw, ArrowLeft } from "lucide-react";
import { sendOtp, verifyOtp } from "@/api/authApi";
import { toast } from "react-toastify";

interface VerifyOtpFormProps {
  email: string;
  onVerified: (otp: string) => void;
  onBack: () => void;
}

const VerifyOtpForm = ({ email, onVerified, onBack }: VerifyOtpFormProps) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // ✅ Đặt các hook vào đây
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const setInputRef = useCallback(
    (index: number) => (el: HTMLInputElement | null) => {
      inputRefs.current[index] = el;
    },
    []
  );


  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedNumbers = pastedData.replace(/\D/g, "").slice(0, 6);
    
    const newOtp = [...otp];
    for (let i = 0; i < pastedNumbers.length; i++) {
      newOtp[i] = pastedNumbers[i];
    }
    setOtp(newOtp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
  
    if (otpString.length !== 6) {
      toast.error("Vui lòng nhập đầy đủ 6 chữ số");
      return;
    }
  
    setLoading(true);
    try {
      await verifyOtp(email, otpString);  // <-- Gọi API mới
      toast.success("Xác thực OTP thành công!");
      onVerified(otpString); // → chuyển qua bước tiếp theo
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  };
  

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await sendOtp(email);
      toast.success("Mã OTP mới đã được gửi!");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error("Không thể gửi lại OTP. Vui lòng thử lại!");
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Icon and Description */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nhập mã xác thực</h3>
          <p className="text-gray-600 leading-relaxed">
            Mã OTP đã được gửi đến{" "}
            <span className="font-semibold text-blue-600">{email}</span>
          </p>
        </div>
      </div>

      {/* OTP Input */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700 text-center">
          Mã xác thực (6 chữ số)
        </label>
        <div className="flex justify-center space-x-3">
          {otp.map((digit, index) => (
            <input
            key={index}
            ref={setInputRef(index)} // ✅ sửa ref
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none"
          />          
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        disabled={loading || otp.join("").length !== 6}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Đang xác thực...
          </div>
        ) : (
          "Xác thực OTP"
        )}
      </button>

      {/* Resend OTP */}
      <div className="text-center space-y-3">
        <p className="text-sm text-gray-600">Không nhận được mã?</p>
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resending || countdown > 0}
          className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
        >
          {resending ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Đang gửi lại...
            </div>
          ) : countdown > 0 ? (
            `Gửi lại sau ${countdown}s`
          ) : (
            <div className="flex items-center">
              <RotateCcw className="w-4 h-4 mr-1" />
              Gửi lại mã OTP
            </div>
          )}
        </button>
      </div>

      {/* Back Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 font-medium hover:underline transition-colors duration-200 flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Thay đổi email
        </button>
      </div>
    </form>
  );
};

export default VerifyOtpForm;