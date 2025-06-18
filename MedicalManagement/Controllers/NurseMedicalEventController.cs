using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/nurse/medical-events")]
[Authorize(Roles = "Nurse")]
public class NurseMedicalEventController : ControllerBase
{
    private readonly IMedicalEventService _service;

    public NurseMedicalEventController(IMedicalEventService service)
    {
        _service = service;
    }

    private int GetNurseId()
    {
        var raw = User.FindFirstValue("reference_id");
        return int.TryParse(raw, out var id) ? id : throw new UnauthorizedAccessException();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id) => Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MedicalEventCreateDTO dto)
    {
        var nurseId = GetNurseId();
        var newId = await _service.CreateAsync(dto, nurseId);
        return Ok(new { message = "Đã ghi nhận sự kiện.", eventId = newId });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] MedicalEventUpdateDTO dto)
    {
        await _service.UpdateAsync(id, dto);
        return Ok(new { message = "Cập nhật thành công." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(int id)
    {
        await _service.SoftDeleteAsync(id);
        return Ok(new { message = "Đã xóa sự kiện (soft delete)." });
    }
}
