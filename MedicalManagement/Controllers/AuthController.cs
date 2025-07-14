using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Responses;
using MedicalManagement.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MedicalManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginDTO loginDto)
        {
            var response = await _authService.LoginAsync(loginDto);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        // ✅ THÊM API ĐỔI MẬT KHẨU
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
        {
            try
            {
                // Lấy UserId từ JWT Token
                var userId = int.Parse(User.FindFirst("UserId").Value);

                var result = await _authService.ChangePasswordAsync(userId, dto);
                if (!result)
                    return NotFound(new { message = "Người dùng không tồn tại hoặc không hợp lệ." });

                return Ok(new { message = "Đổi mật khẩu thành công." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("first-login-change-password")]
        public async Task<IActionResult> FirstLoginChangePassword([FromBody] FirstLoginChangePasswordDTO dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("UserId").Value);
                var success = await _authService.ChangePasswordFirstLoginAsync(userId, dto);

                if (!success)
                    return NotFound(new { message = "Không tìm thấy người dùng hoặc đã đổi mật khẩu rồi." });

                return Ok(new { message = "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpPost("forgot-password-otp")]
        public async Task<IActionResult> ForgotPasswordOtp([FromBody] ForgotPasswordDTO dto)
        {
            var result = await _authService.ForgotPasswordOtpAsync(dto);
            return Ok(new { message = result });
        }

        [HttpPost("verify-otp-only")]
        public async Task<IActionResult> VerifyOtpOnly([FromBody] VerifyOtpOnlyDTO dto)
        {
            try
            {
                var isValid = await _authService.VerifyOtpOnlyAsync(dto.Email, dto.Otp);
                if (!isValid)
                    return BadRequest(new { error = "OTP không hợp lệ hoặc đã hết hạn." });

                return Ok(new { message = "OTP hợp lệ." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpPost("verify-reset-password")]
        public async Task<IActionResult> VerifyOtpReset([FromBody] VerifyOtpResetDTO dto)
        {
            try
            {
                var result = await _authService.VerifyOtpResetPasswordAsync(dto.Email, dto.Otp, dto.NewPassword);
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


    }
}
