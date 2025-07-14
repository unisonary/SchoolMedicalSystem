using System.Threading.Tasks;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Models.Responses;

namespace MedicalManagement.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(LoginDTO loginDto);

        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO dto);

        //Task<string> ForgotPasswordAsync(ForgotPasswordDTO dto);
        //Task<string> ResetPasswordAsync(string token, string newPassword);

        Task<bool> ChangePasswordFirstLoginAsync(int userId, FirstLoginChangePasswordDTO dto);

        Task<string> ForgotPasswordOtpAsync(ForgotPasswordDTO dto);
        Task<string> VerifyOtpResetPasswordAsync(string username, string otp, string newPassword);

        Task<UserAccount> GetUserAccountByEmail(string email);

        Task<bool> VerifyOtpOnlyAsync(string email, string otp);

        Task<string> GetEmailByUser(UserAccount user);
    }
}
