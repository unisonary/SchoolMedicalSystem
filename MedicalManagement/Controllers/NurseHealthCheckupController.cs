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

        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _service.GetAllAsync());

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] HealthCheckupCreateDTO dto)
        {
            var id = await _service.CreateAsync(dto, GetNurseId());
            return Ok(new { message = "Đã ghi kết quả khám", checkupId = id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] HealthCheckupUpdateDTO dto)
        {
            await _service.UpdateAsync(id, dto, GetNurseId());
            return Ok(new { message = "Đã cập nhật kết quả khám." });
        }
    }

}
