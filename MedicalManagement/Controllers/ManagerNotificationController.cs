using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/manager/notifications")]
    [Authorize(Roles = "Manager")]
    public class ManagerNotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public ManagerNotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var result = await _notificationService.GetManagerNotificationsAsync();
            return Ok(result);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var success = await _notificationService.MarkManagerNotificationAsReadAsync(id);
            return success ? Ok() : NotFound();
        }

        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var count = await _notificationService.MarkAllManagerNotificationsAsReadAsync();
            return Ok(new { count });
        }
    }
}
