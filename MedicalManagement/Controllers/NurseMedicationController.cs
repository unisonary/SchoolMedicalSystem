using System.Security.Claims;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/nurse/medications")]
    [Authorize(Roles = "Nurse")]
    public class NurseMedicationController : ControllerBase
    {
        private readonly IMedicationService _service;

        public NurseMedicationController(IMedicationService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetPendingMedications()
        {
            var list = await _service.GetPendingFromParentAsync();
            return Ok(list);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Verify(int id, [FromBody] MedicationVerifyDTO dto)
        {
            var nurseId = int.Parse(User.FindFirstValue("reference_id")); 
            await _service.VerifyAsync(id, dto, nurseId);                 
            return Ok(new { message = "Đã xác nhận thuốc." });
        }

    }

}
