using MedicalManagement.Exceptions;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalManagement.Data;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/manager/assignments")]
    [Authorize(Roles = "Manager")]
    public class ManagerAssignmentController : ControllerBase
    {
        private readonly IAssignmentService _service;
        private readonly AppDbContext _context;

        public ManagerAssignmentController(IAssignmentService service, AppDbContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpGet("consented-students/all")]
        public async Task<IActionResult> GetAllConsentedStudents()
        {
            try
            {
                var result = await _service.GetAllConsentedStudentsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", detail = ex.Message });
            }
        }


        [HttpGet("consented-students/{planId}")]
        public async Task<IActionResult> GetConsentedStudents(int planId)
        {
            try
            {
                var result = await _service.GetConsentedStudentsAsync(planId);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", detail = ex.Message });
            }
        }

        // ✅ Lấy danh sách y tá
        [HttpGet("/api/nurses")]
        public async Task<IActionResult> GetNurses()
        {
            var nurses = await _context.SchoolNurses
                .Select(n => new { nurseId = n.NurseId, name = n.Name })
                .ToListAsync();

            return Ok(nurses);
        }

        [HttpPost]
        public async Task<IActionResult> Assign([FromBody] AssignmentDTO dto)
        {
            await _service.AssignNurseAsync(dto);
            return Ok(new { message = "Đã phân công y tá." });
        }
    }
}
