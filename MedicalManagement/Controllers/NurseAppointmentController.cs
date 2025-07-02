using System.Security.Claims;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/nurse/appointments")]
    [Authorize(Roles = "Nurse")]
    public class NurseAppointmentController : ControllerBase
    {
        private readonly IAppointmentService _service;

        public NurseAppointmentController(IAppointmentService service)
        {
            _service = service;
        }

        private int GetNurseId() => int.Parse(User.FindFirstValue("reference_id"));

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            var data = await _service.GetAllAsync(status);
            if (!data.Any()) return NotFound(new { message = "Không có lịch hẹn nào." });
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AppointmentCreateDTO dto)
        {
            await _service.CreateAsync(dto, GetNurseId());
            return Ok(new { message = "Tạo lịch hẹn thành công." });
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AppointmentUpdateDTO dto)
        {
            await _service.UpdateAsync(id, dto, GetNurseId());
            return Ok(new { message = "Cập nhật lịch hẹn thành công." });
        }
    }

}
