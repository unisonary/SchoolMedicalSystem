using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MedicalManagement.Data;
using MedicalManagement.Helpers;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Models.Responses;
using MedicalManagement.Services.Interfaces;
using System.Text.RegularExpressions;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Collections.Generic;

namespace MedicalManagement.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IJwtHelper _jwtHelper;
        private readonly EmailService _emailService;

        public AuthService(AppDbContext context, IJwtHelper jwtHelper, EmailService emailService)
        {
            _context = context;
            _jwtHelper = jwtHelper;
            _emailService = emailService;
        }   

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO dto)
        {
            var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.UserId == userId && u.IsActive);
            if (user == null) return false;

            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.Password))
                throw new Exception("Mật khẩu cũ không chính xác.");

            // Kiểm tra độ mạnh của mật khẩu mới
            var strong = Regex.IsMatch(dto.NewPassword, @"^(?=.*[A-Z])(?=.*[\W_]).{8,}$");
            if (!strong)
                throw new Exception("Mật khẩu mới phải ≥8 ký tự, có chữ in hoa và ký tự đặc biệt.");

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.IsFirstLogin = false;

            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<AuthResponse> LoginAsync(LoginDTO loginDto)
        {
            var user = await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.Username == loginDto.Username && u.IsActive);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Username or password is incorrect"
                };
            }

            var token = _jwtHelper.GenerateToken(user);

            return new AuthResponse
            {
                Success = true,
                Message = "Login successful",
                User = new UserDTO
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Role = user.Role,
                    Token = token
                },
                IsFirstLogin = user.IsFirstLogin
            };
        }

        public async Task<string> ForgotPasswordAsync(ForgotPasswordDTO dto)
        {
            var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == dto.Username && u.IsActive);
            if (user == null)
                throw new Exception("Không tìm thấy người dùng.");

            // 🔍 Lấy email theo role
            string emailTo = null;
            switch (user.Role)
            {
                case "Student":
                    emailTo = await _context.Students
                        .Where(s => s.StudentId == user.ReferenceId)
                        .Select(s => s.Email)
                        .FirstOrDefaultAsync();
                    break;
                case "Parent":
                    emailTo = await _context.Parents
                        .Where(p => p.ParentId == user.ReferenceId)
                        .Select(p => p.Email)
                        .FirstOrDefaultAsync();
                    break;
                case "Manager":
                    emailTo = await _context.Managers
                        .Where(m => m.ManagerId == user.ReferenceId)
                        .Select(m => m.Email)
                        .FirstOrDefaultAsync();
                    break;
                case "Nurse":
                    emailTo = await _context.SchoolNurses
                        .Where(n => n.NurseId == user.ReferenceId)
                        .Select(n => n.Email)
                        .FirstOrDefaultAsync();
                    break;
                case "Admin":
                    emailTo = await _context.Admins
                        .Where(a => a.AdminId == user.ReferenceId)
                        .Select(a => a.Email)
                        .FirstOrDefaultAsync();
                    break;
            }

            if (string.IsNullOrEmpty(emailTo))
                throw new Exception("Không tìm thấy email người dùng.");

            var token = _jwtHelper.GenerateToken(user);
            var resetLink = $"https://yourapp.com/reset-password?token={token}";

            await _emailService.SendEmailAsync(
                toEmail: emailTo,
                subject: "Khôi phục mật khẩu",
                body: $"Nhấn vào link để đặt lại mật khẩu: {resetLink}"
            );

            return "Đã gửi hướng dẫn khôi phục mật khẩu qua email.";
        }

        public async Task<string> ResetPasswordAsync(string token, string newPassword)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var username = jwtToken.Claims.First(c => c.Type == ClaimTypes.Name).Value;

            var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == username && u.IsActive);
            if (user == null)
                throw new Exception("Token không hợp lệ hoặc người dùng không tồn tại.");

            if (!Regex.IsMatch(newPassword, @"^(?=.*[A-Z])(?=.*[\W_]).{8,}$"))
                throw new Exception("Mật khẩu mới phải ≥8 ký tự, có chữ in hoa và ký tự đặc biệt.");

            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();

            return "Đặt lại mật khẩu thành công.";
        }

        // ✅ 4. ForgotPassword gửi OTP 6 chữ số
        public async Task<string> ForgotPasswordOtpAsync(ForgotPasswordDTO dto)
        {
            var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == dto.Username && u.IsActive);
            if (user == null)
                throw new Exception("Không tìm thấy người dùng.");

            string emailTo = await GetEmailByUser(user);
            if (string.IsNullOrEmpty(emailTo))
                throw new Exception("Không tìm thấy email người dùng.");

            // Tạo mã OTP 6 số
            var otp = new Random().Next(100000, 999999).ToString();
            var expiresAt = DateTime.UtcNow.AddMinutes(5);

            _context.PasswordResetOtps.Add(new PasswordResetOtp
            {
                UserId = user.UserId,
                Otp = otp,
                ExpiresAt = expiresAt,
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                emailTo,
                "Mã xác thực đặt lại mật khẩu",
                $"Mã OTP của bạn là: {otp}\nMã có hiệu lực trong 5 phút."
            );

            return "Mã OTP đã được gửi đến email của bạn.";
        }

        // ✅ 5. Xác thực OTP và đặt lại mật khẩu
        public async Task<string> VerifyOtpResetPasswordAsync(string username, string otp, string newPassword)
        {
            var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == username && u.IsActive);
            if (user == null)
                throw new Exception("Không tìm thấy người dùng.");

            var otpValid = await _context.PasswordResetOtps.FirstOrDefaultAsync(p =>
                p.UserId == user.UserId &&
                p.Otp == otp &&
                p.IsUsed == false &&
                p.ExpiresAt > DateTime.UtcNow);

            if (otpValid == null)
                throw new Exception("OTP không hợp lệ hoặc đã hết hạn.");

            if (!PasswordValidator.IsStrong(newPassword))
                throw new Exception("Mật khẩu mới phải ≥8 ký tự, có chữ in hoa và ký tự đặc biệt.");


            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            otpValid.IsUsed = true;
            await _context.SaveChangesAsync();

            return "Đặt lại mật khẩu thành công.";
        }

        // ✅ 6. Hàm lấy email theo role dùng chung
        private async Task<string> GetEmailByUser(UserAccount user)
        {
            return user.Role switch
            {
                "Student" => await _context.Students.Where(s => s.StudentId == user.ReferenceId).Select(s => s.Email).FirstOrDefaultAsync(),
                "Parent" => await _context.Parents.Where(p => p.ParentId == user.ReferenceId).Select(p => p.Email).FirstOrDefaultAsync(),
                "Manager" => await _context.Managers.Where(m => m.ManagerId == user.ReferenceId).Select(m => m.Email).FirstOrDefaultAsync(),
                "Nurse" => await _context.SchoolNurses.Where(n => n.NurseId == user.ReferenceId).Select(n => n.Email).FirstOrDefaultAsync(),
                "Admin" => await _context.Admins.Where(a => a.AdminId == user.ReferenceId).Select(a => a.Email).FirstOrDefaultAsync(),
                _ => null
            };
        }
    }
}
