using System.Security.Claims;
using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/nurse/checkups")]
    [Authorize(Roles = "Nurse")]
    public class NurseHealthCheckupController : ControllerBase
    {
        private readonly IHealthCheckupService _service;
        private readonly IMedicalPlanService _medicalPlanService;
        private readonly AppDbContext _context;



        public NurseHealthCheckupController(IHealthCheckupService service, IMedicalPlanService medicalPlanService, AppDbContext context)
        {
            _service = service;
            _medicalPlanService = medicalPlanService;
            _context = context;
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

        [HttpGet("by-plan-name")]
        public async Task<IActionResult> GetByPlanNameAndNurse([FromQuery] string planName)
        {
            int nurseId = int.Parse(User.FindFirst("reference_id")?.Value!);

            // Lấy planId từ MedicalPlanService
            var planId = await _medicalPlanService.GetPlanIdByNameAsync(planName);

            if (planId == null)
                return NotFound("Không tìm thấy kế hoạch phù hợp.");

            var result = await _service.GetByPlanIdAndNurseAsync(planId.Value, nurseId);
            return Ok(result);
        }

        [HttpGet("plans/health-checkup-names")]
        public async Task<IActionResult> GetHealthCheckupPlanNames()
        {
            var plans = await _context.MedicalPlans
                .Where(p => p.PlanType == "Health_Checkup")
                .Select(p => new { p.PlanId, p.PlanName })
                .ToListAsync();

            return Ok(plans);
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] HealthCheckupUpdateDTO dto)
        {
            await _service.UpdateAsync(id, dto, GetNurseId());
            return Ok(new { message = "Đã cập nhật kết quả khám." });
        }
    }

}
