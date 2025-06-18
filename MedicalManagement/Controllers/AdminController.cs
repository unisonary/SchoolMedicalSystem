using Microsoft.AspNetCore.Mvc;
using MedicalManagement.Services.Interfaces;
using MedicalManagement.Models.DTOs.UserAccount;
using System.Threading.Tasks;

namespace MedicalManagement.Controllers
{
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpPost("create-account")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDTO dto)
        {
            var success = await _adminService.CreateUserAsync(dto);
            if (!success)
                return BadRequest("Tạo tài khoản thất bại");
            return Ok("Tạo tài khoản thành công");
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] string role)
        {
            var users = await _adminService.GetUsersByRoleAsync(role);
            return Ok(users);
        }

        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetUserPasswordDTO dto)
        {
            var success = await _adminService.ResetPasswordAsync(dto);
            if (!success)
                return NotFound("Không tìm thấy tài khoản");
            return Ok("Mật khẩu đã được đặt lại");
        }
    }
}
