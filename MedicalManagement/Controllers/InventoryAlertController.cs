using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/manager/inventory-alerts")]
    [Authorize(Roles = "Manager")]
    public class InventoryAlertController : ControllerBase
    {
        private readonly IInventoryAlertService _alertService;

        public InventoryAlertController(IInventoryAlertService alertService)
        {
            _alertService = alertService;
        }

        [HttpGet]
        public async Task<IActionResult> GetFilteredAlerts([FromQuery] string? alertType)
        {
            var result = await _alertService.GetAlertsAsync(alertType);
            return Ok(result);
        }
    }

}
