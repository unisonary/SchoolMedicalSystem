using System.Security.Claims;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/nurse/vaccinations")]
    [Authorize(Roles = "Nurse")]
    public class NurseVaccinationController : ControllerBase
    {
        private readonly IVaccinationService _service;

        public NurseVaccinationController(IVaccinationService service)
        {
            _service = service;
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


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] VaccinationUpdateDTO dto)
        {
            var nurseId = GetNurseId();
            await _service.UpdateAsync(id, dto, nurseId);

            return Ok(new { message = "Đã cập nhật thông tin phản ứng." });
        }
    }

}
