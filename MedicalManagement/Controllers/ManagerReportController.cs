using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/manager/reports")]
    [Authorize(Roles = "Manager")]
    public class ManagerReportController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly AppDbContext _context;


        public ManagerReportController(IReportService reportService, AppDbContext context)
        {
            _reportService = reportService;
            _context = context;
        }

        [HttpPost("participation")]
        public async Task<IActionResult> GetParticipationReport([FromBody] ParticipationReportFilterDTO filter)
        {
            var result = await _reportService.GetParticipationReportAsync(filter);
            return Ok(result);
        }


        [HttpPost("participation/export")]
        public async Task<IActionResult> ExportParticipationReportToExcel([FromQuery] int? planId)
        {
            var filter = new ParticipationReportFilterDTO { PlanId = planId };
            var fileBytes = await _reportService.ExportParticipationReportToExcelAsync(filter);
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "ParticipationReport.xlsx");
        }


        [HttpGet("vaccines/names")]
        public async Task<IActionResult> GetVaccineNames()
        {
            var names = await _context.Vaccinations
                .Select(v => v.VaccineName)
                .Where(name => !string.IsNullOrEmpty(name))
                .Distinct()
                .OrderBy(name => name)
                .ToListAsync();

            return Ok(names);
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
            return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"VaccinationReport_{DateTime.Now:yyyyMMddHHmm}.xlsx");
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
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"HealthCheckupReport_{DateTime.Now:yyyyMMddHHmm}.xlsx");
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
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"InventoryReport_{DateTime.Now:yyyyMMddHHmm}.xlsx");
        }
    }
}
