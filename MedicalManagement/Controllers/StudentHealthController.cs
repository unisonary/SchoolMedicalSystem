using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MedicalManagement.Controllers
{
    [Route("api/student/health")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class StudentHealthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentHealthController(AppDbContext context)
        {
            _context = context;
        }

        private async Task<int?> GetStudentIdFromTokenAsync()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == username && u.Role == "Student");
            return user?.ReferenceId;
        }

        [HttpGet("events")]
        public async Task<ActionResult<IEnumerable<MedicalEventDTO>>> GetMedicalEvents()
        {
            var studentId = await GetStudentIdFromTokenAsync();
            if (studentId == null) return Unauthorized();

            var events = await _context.MedicalEvents
                .Include(e => e.Nurse) 
                .Where(e => e.StudentId == studentId)
                .Select(e => new MedicalEventDTO
                {
                    EventId = e.EventId,
                    Date = e.Date,
                    Description = e.Description,
                    Severity = e.Severity,
                    EventType = e.EventType,
                    NurseName = e.Nurse.Name 
                }).ToListAsync();

            return Ok(events);
        }


        [HttpGet("vaccinations")]
        public async Task<ActionResult<IEnumerable<VaccinationDTO>>> GetVaccinations()
        {
            var studentId = await GetStudentIdFromTokenAsync();
            if (studentId == null) return Unauthorized();

            var vaccinations = await _context.Vaccinations
                .Include(v => v.Nurse)
                .Where(v => v.StudentId == studentId)
                .Select(v => new VaccinationDTO
                {
                    VaccinationId = v.VaccinationId,
                    VaccineName = v.VaccineName,
                    Date = v.Date,
                    NurseName = v.Nurse.Name,
                    Reaction = v.Reaction,
                    NextDoseDue = v.NextDoseDue
                }).ToListAsync();

            return Ok(vaccinations);
        }

        [HttpGet("checkups")]
        public async Task<ActionResult<IEnumerable<HealthCheckupDTO>>> GetCheckups()
        {
            var studentId = await GetStudentIdFromTokenAsync();
            if (studentId == null) return Unauthorized();

            var checkups = await _context.HealthCheckups
                .Include(c => c.Nurse) 
                .Where(c => c.StudentId == studentId)
                .Select(c => new HealthCheckupDTO
                {
                    CheckupId = c.CheckupId,
                    CheckupType = c.CheckupType,
                    Date = c.Date,
                    Result = c.Result,
                    Recommendations = c.Recommendations,
                    NurseName = c.Nurse.Name 
                }).ToListAsync();

            return Ok(checkups);
        }

    }
}
