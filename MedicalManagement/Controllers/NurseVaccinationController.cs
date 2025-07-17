using System.Security.Claims;
using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/nurse/vaccinations")]
    [Authorize(Roles = "Nurse")]
    public class NurseVaccinationController : ControllerBase
    {
        private readonly IVaccinationService _service;
        private readonly AppDbContext _context;


        public NurseVaccinationController(IVaccinationService service, AppDbContext context)
        {
            _service = service;
            _context = context;
        }

        private int GetNurseId() => int.Parse(User.FindFirstValue("reference_id"));

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int planId)
        {
            var result = await _service.GetAllAsync(planId);
            return Ok(result);
        }

        [HttpGet("by-plan/{planId}")]
        public async Task<IActionResult> GetByPlanAndNurse(int planId)
        {
            int nurseId = GetNurseId();
            var result = await _service.GetByPlanIdAndNurseAsync(planId, nurseId);
            return Ok(result);
        }

        [HttpGet("plans/vaccinations-names")]
        public async Task<IActionResult> GetHealthCheckupPlanNames()
        {
            var plans = await _context.MedicalPlans
                .Where(p => p.PlanType == "Vaccination")
                .Select(p => new { p.PlanId, p.PlanName })
                .ToListAsync();

            return Ok(plans);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] VaccinationUpdateDTO dto)
        {
            var nurseId = GetNurseId();
            await _service.UpdateAsync(id, dto, nurseId);

            return Ok(new { message = "Đã cập nhật thông tin phản ứng." });
        }
    }

}
