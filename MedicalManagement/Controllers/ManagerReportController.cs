using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/manager/reports")]
    [Authorize(Roles = "Manager")]
    public class ManagerReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ManagerReportController(IReportService reportService)
        {
            _reportService = reportService;
        }


        [HttpPost("vaccination")]
        public async Task<IActionResult> GetVaccinationReport([FromBody] VaccinationReportFilterDTO filter)
        {
            var result = await _reportService.GetVaccinationReportAsync(filter);
            return Ok(result);
        }

        [HttpPost("vaccination/export")]
        public async Task<IActionResult> ExportVaccinationReport([FromBody] VaccinationReportFilterDTO filter)
        {
            var file = await _reportService.ExportVaccinationReportToExcel(filter);
            return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "VaccinationReport.xlsx");
        }


        [HttpPost("health-checkup")]
        public async Task<IActionResult> GetHealthCheckupReport([FromBody] HealthCheckupReportFilterDTO filter)
        {
            var result = await _reportService.GetHealthCheckupReportAsync(filter);
            return Ok(result);
        }

        [HttpPost("health-checkup/export")]
        public async Task<IActionResult> ExportHealthCheckupReport([FromBody] HealthCheckupReportFilterDTO filter)
        {
            var fileBytes = await _reportService.ExportHealthCheckupReportToExcelAsync(filter);
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "HealthCheckupReport.xlsx");
        }

        [HttpPost("inventory")]
        public async Task<IActionResult> GetInventoryReport([FromBody] InventoryReportFilterDTO filter)
        {
            var result = await _reportService.GetInventoryReportAsync(filter);
            return Ok(result);
        }

        [HttpPost("inventory/export")]
        public async Task<IActionResult> ExportInventoryReport([FromBody] InventoryReportFilterDTO filter)
        {
            var fileBytes = await _reportService.ExportInventoryReportToExcelAsync(filter);
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "InventoryReport.xlsx");
        }


    }

}
