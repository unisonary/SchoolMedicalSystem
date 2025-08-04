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
        private readonly IConsentService _consentService;
        private readonly AppDbContext _context;

        public ManagerAssignmentController(IAssignmentService service, IConsentService consentService, AppDbContext context)
        {
            _service = service;
            _consentService = consentService;
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

        // ✅ Consent Management Endpoints
        [HttpGet("consents/{planId}")]
        public async Task<IActionResult> GetConsentsByPlan(int planId)
        {
            try
            {
                var result = await _consentService.GetAllConsentsByPlanAsync(planId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", detail = ex.Message });
            }
        }

        [HttpGet("consents/denied")]
        public async Task<IActionResult> GetDeniedConsents([FromQuery] int? planId = null)
        {
            try
            {
                var result = await _consentService.GetDeniedConsentsAsync(planId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", detail = ex.Message });
            }
        }

        [HttpGet("consents/email-denied")]
        public async Task<IActionResult> GetEmailDeniedConsents([FromQuery] int? planId = null)
        {
            try
            {
                var result = await _consentService.GetEmailDeniedConsentsAsync(planId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", detail = ex.Message });
            }
        }

        [HttpPut("consents/{consentId}/notes")]
        public async Task<IActionResult> UpdateConsentNotes(int consentId, [FromBody] ConsentNotesUpdateDTO dto)
        {
            try
            {
                await _consentService.UpdateConsentNotesAsync(consentId, dto.Notes);
                return Ok(new { message = "Đã cập nhật lý do từ chối." });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", detail = ex.Message });
            }
        }
    }
}
