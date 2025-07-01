using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/parent/student")]
    [Authorize(Roles = "Parent")]
    public class ParentStudentProgressController : ControllerBase
    {
        private readonly IParentStudentService _service;

        public ParentStudentProgressController(IParentStudentService service)
        {
            _service = service;
        }

        private string GetUsername() => User.FindFirstValue(ClaimTypes.Name);

        [HttpGet("events")]
        public async Task<IActionResult> GetMedicalEvents() => Ok(await _service.GetMedicalEventsAsync(GetUsername()));

        [HttpGet("checkups")]
        public async Task<IActionResult> GetHealthCheckups() => Ok(await _service.GetHealthCheckupsAsync(GetUsername()));

        [HttpGet("notifications")]
        public async Task<IActionResult> GetMedicalNotifications() => Ok(await _service.GetMedicalNotificationsAsync(GetUsername()));

        [HttpPut("notifications/{id}/read")]
        public async Task<IActionResult> MarkNotificationAsRead(int id)
        {
            var success = await _service.MarkNotificationAsReadAsync(GetUsername(), id);
            return success ? Ok(new { message = "Đã đánh dấu là đã đọc." }) : NotFound(new { message = "Không tìm thấy thông báo." });
        }
    }

}
