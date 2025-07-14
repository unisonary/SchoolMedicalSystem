using Microsoft.AspNetCore.Mvc;
using MedicalManagement.Services.Interfaces;
using MedicalManagement.Models.DTOs.UserAccount;
using System.Threading.Tasks;
using MedicalManagement.Data;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;
using MedicalManagement.Helpers;
using Microsoft.AspNetCore.Authorization;
///This is the class that for managing accounts
namespace MedicalManagement.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly AppDbContext _context;


        public AdminController(IAdminService adminService, AppDbContext context)
        {
            _adminService = adminService;
            _context = context;
        }

        [HttpGet("classes")]
        public async Task<IActionResult> GetClasses()
        {
            var classes = await _context.Students
                .Where(s => s.Class != null)
                .Select(s => s.Class)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(classes);
        }

        [HttpGet("all-parents")]
        public async Task<IActionResult> GetAllParents()
        {
            var parents = await _context.Parents
                .Select(p => new
                {
                    p.ParentId,
                    p.Name,
                    p.Email
                })
                .ToListAsync();

            return Ok(parents);
        }

        [HttpGet("search-parents")]
        public async Task<IActionResult> SearchParentsByName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest(new { message = "Thiếu tên để tìm kiếm." });

            string normalizedInput = RemoveDiacritics(name.ToLower());

            var parents = await _context.Parents.ToListAsync();

            var result = parents
                .Where(p => RemoveDiacritics(p.Name.ToLower()).Contains(normalizedInput))
                .Select(p => new
                {
                    parentId = p.ParentId,
                    name = p.Name,
                    email = p.Email,
                    phone = p.Phone
                })
                .Take(10)
                .ToList();

            return Ok(result);
        }

        private string RemoveDiacritics(string text)
        {
            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }



        [HttpPost("create-account")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDTO dto)
        {
            var success = await _adminService.CreateUserAsync(dto);
            if (!success)
                return BadRequest("Tạo tài khoản thất bại. Vui lòng kiểm tra dữ liệu đầu vào.");
            return Ok("Tạo tài khoản thành công.");
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
            try
            {
                var success = await _adminService.ResetPasswordAsync(dto);
                if (!success)
                    return NotFound("Không tìm thấy tài khoản");

                return Ok("Mật khẩu đã được đặt lại");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message); // Mật khẩu không đủ mạnh
            }
            catch (Exception)
            {
                return StatusCode(500, "Lỗi hệ thống khi đặt lại mật khẩu");
            }
        }


        //This guy is used to import users from file excel
        [HttpPost("import-users")]
        public async Task<IActionResult> ImportUsersFromExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Chưa chọn file.");

            var createdBy = JwtHelper.GetUserIdFromClaims(User); 
            var result = await _adminService.ImportUsersFromExcelWithClosedXmlAsync(file, createdBy);
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
