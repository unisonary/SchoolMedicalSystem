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

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO dto)
        {
            var result = await _authService.ForgotPasswordAsync(dto);
            return Ok(new { message = result });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO dto)
        {
            var result = await _authService.ResetPasswordAsync(dto.Token, dto.NewPassword);
            return Ok(new { message = result });
        }

        [HttpPost("forgot-password-otp")]
        public async Task<IActionResult> ForgotPasswordOtp([FromBody] ForgotPasswordDTO dto)
        {
            var result = await _authService.ForgotPasswordOtpAsync(dto);
            return Ok(new { message = result });
        }

        [HttpPost("verify-reset-password")]
        public async Task<IActionResult> VerifyOtpReset([FromBody] VerifyOtpResetDTO dto)
        {
            try
            {
                var result = await _authService.VerifyOtpResetPasswordAsync(dto.Username, dto.Otp, dto.NewPassword);
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


    }
}
