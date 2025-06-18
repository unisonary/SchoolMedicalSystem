using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/nurse/supply-log")]
    [Authorize(Roles = "Nurse")]
    public class NurseSupplyLogController : ControllerBase
    {
        private readonly ISupplyLogService _service;

        public NurseSupplyLogController(ISupplyLogService service)
        {
            _service = service;
        }

        private int GetNurseId()
        {
            var raw = User.FindFirstValue("reference_id");
            return int.TryParse(raw, out var id) ? id : throw new UnauthorizedAccessException();
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var logs = await _service.GetAllAsync();
            return Ok(logs);
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SupplyLogCreateDTO dto)
        {
            var nurseId = GetNurseId();
            await _service.CreateAsync(dto, nurseId);
            return Ok(new { message = "Đã ghi nhận sử dụng thuốc." });
        }
    }

}
