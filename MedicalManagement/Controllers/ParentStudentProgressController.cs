using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
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
        private readonly AppDbContext _context;

        public ParentStudentProgressController(AppDbContext context)
        {
            _context = context;
        }

        private async Task<List<int>> GetStudentIdsFromParentTokenAsync()
        {

            var username = User.FindFirstValue(ClaimTypes.Name);
            var user = await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.Username == username && u.Role == "Parent");

            if (user == null) return new List<int>();

            return await _context.Students
                .Where(s => s.ParentId == user.ReferenceId)
                .Select(s => s.StudentId)
                .ToListAsync();
        }

        [HttpGet("events")]
        public async Task<IActionResult> GetMedicalEvents()
        {
            var studentIds = await GetStudentIdsFromParentTokenAsync();

            var list = await _context.MedicalEvents
                .Where(e => studentIds.Contains(e.StudentId))
                .Select(e => new MedicalEventDTO
                {
                    EventId = e.EventId,
                    StudentId = e.StudentId,
                    StudentName = _context.Students.Where(s => s.StudentId == e.StudentId).Select(s => s.Name).FirstOrDefault(),
                    EventType = e.EventType,
                    Description = e.Description,
                    Date = e.Date,
                    NurseName = _context.SchoolNurses.Where(n => n.NurseId == e.NurseId).Select(n => n.Name).FirstOrDefault()
                })
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("checkups")]
        public async Task<IActionResult> GetHealthCheckups()
        {
            var studentIds = await GetStudentIdsFromParentTokenAsync();

            var list = await _context.HealthCheckups
                .Where(c => studentIds.Contains(c.StudentId))
                .Select(c => new HealthCheckupDTO
                {
                    CheckupId = c.CheckupId,
                    StudentId = c.StudentId,
                    StudentName = _context.Students.Where(s => s.StudentId == c.StudentId).Select(s => s.Name).FirstOrDefault(),
                    Result = c.Result,
                    Date = c.Date,
                    Recommendations = c.Recommendations,
                })
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("notifications")]
        public async Task<IActionResult> GetMedicalNotifications()
        {
            var studentIds = await GetStudentIdsFromParentTokenAsync();

            var list = await _context.MedicalNotifications
                .Where(n => studentIds.Contains(n.StudentId) && n.RecipientType == "Parent")
                .Select(n => new MedicalNotificationDTO
                {
                    NotificationId = n.NotificationId,
                    StudentId = n.StudentId,
                    StudentName = _context.Students.Where(s => s.StudentId == n.StudentId).Select(s => s.Name).FirstOrDefault(),
                    Title = n.Title,
                    Content = n.Content,
                    Date = n.Date,
                    IsRead = n.IsRead
                })
                .ToListAsync();

            return Ok(list);
        }
    }
}
