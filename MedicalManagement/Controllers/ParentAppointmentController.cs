using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/parent/appointments")]
[Authorize(Roles = "Parent")]
public class ParentAppointmentController : ControllerBase
{
    private readonly IAppointmentService _service;

    public ParentAppointmentController(IAppointmentService service)
    {
        _service = service;
    }

    private int GetParentId()
    {
        var raw = User.FindFirstValue("reference_id");
        return int.TryParse(raw, out var id) ? id : throw new UnauthorizedAccessException();
    }

    [HttpPost]
    public async Task<IActionResult> CreateAppointment([FromBody] AppointmentCreateDTO dto)
    {
        await _service.CreateAppointmentAsync(GetParentId(), dto);
        return Ok(new { message = "Đặt lịch tư vấn thành công." });
    }

    [HttpGet]
    public async Task<IActionResult> GetAppointments()
    {
        var data = await _service.GetAppointmentsAsync(GetParentId());
        return Ok(data);
    }
}
