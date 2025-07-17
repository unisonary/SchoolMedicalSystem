using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Controllers
{

    [Authorize(Roles = "Nurse")]
    [ApiController]
    [Route("api/nurse/medical-condition")]
    public class NurseMedicalConditionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NurseMedicalConditionController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{studentId}")]
        public async Task<IActionResult> GetMedicalConditionByStudentId(int studentId)
        {
            var student = await _context.Students.FindAsync(studentId);
            if (student == null)
            {
                return NotFound(new { message = "Học sinh không tồn tại." });
            }

            var conditions = await _context.MedicalConditions
                .Where(c => c.StudentId == studentId && c.IsActive)
                .Select(c => new MedicalConditionDTO
                {
                    ConditionId = c.ConditionId,
                    ConditionType = c.ConditionType,
                    ConditionName = c.ConditionName,
                    Severity = c.Severity,
                    Description = c.Description,
                    StudentId = c.StudentId,
                    StudentName = student.Name
                })
                .ToListAsync();

            return Ok(conditions);
        }
    }

}
