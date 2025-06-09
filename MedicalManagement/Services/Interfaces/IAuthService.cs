using System.Threading.Tasks;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Responses;

namespace MedicalManagement.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(LoginDTO loginDto);

        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO dto);

        Task<string> ForgotPasswordAsync(ForgotPasswordDTO dto);
        Task<string> ResetPasswordAsync(string token, string newPassword);

        Task<string> ForgotPasswordOtpAsync(ForgotPasswordDTO dto);
        Task<string> VerifyOtpResetPasswordAsync(string username, string otp, string newPassword);

    }
}
