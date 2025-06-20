using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/manager/assignments")]
    [Authorize(Roles = "Manager")]
    public class ManagerAssignmentController : ControllerBase
    {
        private readonly IAssignmentService _service;

        public ManagerAssignmentController(IAssignmentService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Assign([FromBody] AssignmentDTO dto)
        {
            await _service.AssignNurseAsync(dto);
            return Ok(new { message = "Đã phân công y tá." });
        }
    }

}
