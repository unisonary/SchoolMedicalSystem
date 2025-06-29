import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import RequestOtpForm from "./RequestOtpForm";
import VerifyOtpForm from "./VerifyOtpForm";
import ResetPasswordForm from "./ResetPasswordForm";

const ForgotPasswordPage = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  // Load trạng thái từ localStorage khi component mount
  useEffect(() => {
    const savedStep = localStorage.getItem("forgot_step");
    const savedEmail = localStorage.getItem("forgot_email");
    const savedOtp = localStorage.getItem("forgot_otp");

    if (savedStep) setStep(Number(savedStep));
    if (savedEmail) setEmail(savedEmail);
    if (savedOtp) setOtp(savedOtp);
  }, []);

  // Lưu lại trạng thái mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("forgot_step", step.toString());
    localStorage.setItem("forgot_email", email);
    localStorage.setItem("forgot_otp", otp);
  }, [step, email, otp]);

  const handleBackToLogin = () => {
    localStorage.removeItem("forgot_step");
    localStorage.removeItem("forgot_email");
    localStorage.removeItem("forgot_otp");
    onBack();
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Xác thực Email";
      case 2: return "Nhập mã OTP";
      case 3: return "Đặt lại mật khẩu";
      default: return "Khôi phục mật khẩu";
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={handleBackToLogin} 
          className="text-blue-600 hover:text-blue-800 mb-6 flex items-center group transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" size={20} />
          Quay lại đăng nhập
        </button>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Khôi phục mật khẩu</h2>
          <p className="text-gray-600 text-lg">{getStepTitle()}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mt-8 space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  stepNumber === step
                    ? "bg-blue-600 text-white shadow-lg"
                    : stepNumber < step
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {stepNumber < step ? "✓" : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-12 h-1 mx-2 transition-all duration-300 ${
                    stepNumber < step ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="min-h-[300px]">
        {step === 1 && (
          <RequestOtpForm onNext={(email) => { setEmail(email); setStep(2); }} />
        )}
        {step === 2 && (
          <VerifyOtpForm 
            email={email}
            onVerified={(otp) => { setOtp(otp); setStep(3); }} 
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <ResetPasswordForm 
            email={email} 
            otp={otp} 
            onSuccess={handleBackToLogin}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
