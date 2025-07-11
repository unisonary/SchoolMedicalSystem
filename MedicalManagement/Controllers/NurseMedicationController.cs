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
        public async Task<IActionResult> GetMedicationsByStatus([FromQuery] string status = "Active")
        {
            var list = await _service.GetFromParentByStatusAsync(status);
            return Ok(list);
        }


        [HttpPost]
        public async Task<IActionResult> AddMedication([FromBody] MedicationCreateDTO dto)
        {
            var nurseId = int.TryParse(User.FindFirstValue("reference_id"), out var id) ? id : 0;
            if (nurseId == 0)
                return Unauthorized("Không tìm được thông tin y tá.");

            await _service.CreateByNurseAsync(dto, nurseId);
            return Ok(new { message = "Đã thêm thuốc cho học sinh." });
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
