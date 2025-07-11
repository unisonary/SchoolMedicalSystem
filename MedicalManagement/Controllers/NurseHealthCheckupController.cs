using System.Security.Claims;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/nurse/checkups")]
    [Authorize(Roles = "Nurse")]
    public class NurseHealthCheckupController : ControllerBase
    {
        private readonly IHealthCheckupService _service;

        public NurseHealthCheckupController(IHealthCheckupService service)
        {
            _service = service;
        }

        private int GetNurseId() => int.Parse(User.FindFirstValue("reference_id"));

        [HttpGet("plan/{planId}")]
        public async Task<IActionResult> GetByPlanId(int planId)
        {
            var result = await _service.GetByPlanIdAsync(planId);
            return Ok(result);
        }

        [HttpGet("by-plan/{planId}")]
        public async Task<IActionResult> GetByPlanAndNurse(int planId)
        {
            int nurseId = int.Parse(User.FindFirst("reference_id")?.Value!); 
            var result = await _service.GetByPlanIdAndNurseAsync(planId, nurseId);
            return Ok(result);
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] HealthCheckupUpdateDTO dto)
        {
            await _service.UpdateAsync(id, dto, GetNurseId());
            return Ok(new { message = "Đã cập nhật kết quả khám." });
        }
    }

}
