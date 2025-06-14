using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Authorize(Roles = "Nurse")]
[Route("api/nurse/health")]
public class NurseHealthController : ControllerBase
{
    private readonly IMedicationService _svc;
    public NurseHealthController(IMedicationService svc) => _svc = svc;

    [HttpGet("medications")]
    public async Task<IActionResult> GetMedications()
    {
        var list = await _svc.GetForNurseAsync();
        return Ok(list);
    }

    [HttpPut("medication/{id}")]
    public async Task<IActionResult> UpdateMedication(int id, [FromBody] NurseMedicationUpdateDTO dto)
    {
        var nurseId = int.Parse(User.FindFirstValue("reference_id"));
        await _svc.UpdateByNurseAsync(nurseId, id, dto);
        return NoContent();
    }
}
