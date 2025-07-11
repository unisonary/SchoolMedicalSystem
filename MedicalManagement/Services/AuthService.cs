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
            // Lấy tất cả tài khoản còn hoạt động
            var users = await _context.UserAccounts
                .Where(u => u.IsActive)
                .ToListAsync();

            // Tìm user khớp username hoặc email
            UserAccount matchedUser = null;

            foreach (var user in users)
            {
                var email = await GetEmailByUser(user);
                if (user.Username == loginDto.UsernameOrEmail || email == loginDto.UsernameOrEmail)
                {
                    matchedUser = user;
                    break;
                }
            }

            if (matchedUser == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, matchedUser.Password))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Email/Username hoặc mật khẩu không đúng."
                };
            }

            // Tạo JWT token
            var token = _jwtHelper.GenerateToken(matchedUser);

            return new AuthResponse
            {
                Success = true,
                Message = "Đăng nhập thành công.",
                User = new UserDTO
                {
                    UserId = matchedUser.UserId,
                    Username = matchedUser.Username,
                    Role = matchedUser.Role,
                    Token = token
                },
                IsFirstLogin = matchedUser.IsFirstLogin
            };
        }
        public async Task<string> ForgotPasswordOtpAsync(ForgotPasswordDTO dto)
        {
            var userList = await _context.UserAccounts.Where(u => u.IsActive).ToListAsync();

            UserAccount matchedUser = null;

            foreach (var user in userList)
            {
                var email = await GetEmailByUser(user);
                if (email == dto.Email)
                {
                    matchedUser = user;
                    break;
                }
            }

            if (matchedUser == null)
                throw new Exception("Không tìm thấy người dùng với email này.");

            string emailTo = await GetEmailByUser(matchedUser);
            if (string.IsNullOrEmpty(emailTo))
                throw new Exception("Không tìm thấy email người dùng.");

            // OTP logic như cũ
            var otp = new Random().Next(100000, 999999).ToString();
            var expiresAt = DateTime.UtcNow.AddMinutes(5);

            _context.PasswordResetOtps.Add(new PasswordResetOtp
            {
                UserId = matchedUser.UserId,
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

        public async Task<bool> VerifyOtpOnlyAsync(string email, string otp)
        {
            var user = await GetUserAccountByEmail(email);
            if (user == null)
                throw new Exception("Không tìm thấy người dùng với email này.");

            var isValid = await _context.PasswordResetOtps.AnyAsync(p =>
                p.UserId == user.UserId &&
                p.Otp == otp &&
                p.IsUsed == false &&
                p.ExpiresAt > DateTime.UtcNow);

            return isValid;
        }


        private async Task<UserAccount> GetUserAccountByEmail(string email)
        {
            var users = await _context.UserAccounts
                .Where(u => u.IsActive)
                .ToListAsync();

            foreach (var user in users)
            {
                var userEmail = await GetEmailByUser(user);
                if (userEmail == email)
                {
                    return user;
                }
            }

            return null;
        }




        // ✅ 5. Xác thực OTP và đặt lại mật khẩu
        public async Task<string> VerifyOtpResetPasswordAsync(string email, string otp, string newPassword)
        {
            var user = await GetUserAccountByEmail(email);
            if (user == null)
                throw new Exception("Không tìm thấy người dùng với email này.");

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
        public async Task<string> GetEmailByUser(UserAccount user)
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

        Task<UserAccount> IAuthService.GetUserAccountByEmail(string email)
        {
            return GetUserAccountByEmail(email);
        }
    }
}
