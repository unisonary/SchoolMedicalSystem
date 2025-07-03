using MedicalManagement.Exceptions;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/manager/assignments")]
    [Authorize(Roles = "Manager")]
    public class ManagerAssignmentController : ControllerBase
    {
        private readonly IAssignmentService _service;

        public ManagerAssignmentController(IAssignmentService service)
        {
            _service = service;
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

        [HttpPost]
        public async Task<IActionResult> Assign([FromBody] AssignmentDTO dto)
        {
            await _service.AssignNurseAsync(dto);
            return Ok(new { message = "Đã phân công y tá." });
        }
    }

}
