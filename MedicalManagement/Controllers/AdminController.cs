using Microsoft.AspNetCore.Mvc;
using MedicalManagement.Services.Interfaces;
using MedicalManagement.Models.DTOs.UserAccount;
using System.Threading.Tasks;
///This is the class that for managing accounts
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
        //This guy is used to import users from file excel
        [HttpPost("import-users")]
        public async Task<IActionResult> ImportUsersFromExcel(IFormFile file, [FromQuery] int createdBy = 1)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Chưa chọn file.");

            var result = await _adminService.ImportUsersFromExcelAsync(file, createdBy);
            return Ok(result);
        }
        // Cập nhật người dùng
        [HttpPut("update-user")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDTO dto)
        {
            var success = await _adminService.UpdateUserAsync(dto);
            return success ? Ok("Cập nhật thành công") : NotFound("Không tìm thấy người dùng");
        }

        // Vô hiệu hóa tài khoản
        [HttpPut("deactivate/{userId}")]
        public async Task<IActionResult> DeactivateUser(int userId)
        {
            var success = await _adminService.DeactivateUserAsync(userId);
            return success ? Ok("Đã vô hiệu hóa tài khoản") : NotFound("Không tìm thấy người dùng");
        }

        // Tìm kiếm người dùng theo username
        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string query)
        {
            var users = await _adminService.SearchUsersAsync(query);
            return Ok(users);
        }

    }
}
