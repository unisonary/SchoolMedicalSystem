using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MedicalManagement.Controllers
{
    [Route("api/parent/health")]
    [ApiController]
    [Authorize(Roles = "Parent")]
    public class ParentHealthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMedicationService _svc;
        public ParentHealthController(AppDbContext context, IMedicationService svc)
        {
            _context = context;
            _svc = svc;
        }

        [HttpGet("students")]
        public async Task<IActionResult> GetMyStudents()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == username && u.Role == "Parent");

            if (user == null) return Unauthorized();

            var students = await _context.Students
                .Where(s => s.ParentId == user.ReferenceId)
                .Select(s => new {
                    s.StudentId,
                    s.Name,
                    s.Class,
                    s.DateOfBirth
                }).ToListAsync();

            return Ok(students);
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


        [HttpPost("medical-condition")]
        public async Task<IActionResult> AddMedicalCondition([FromBody] MedicalConditionCreateDTO dto)
        {
            var studentIds = await GetStudentIdsFromParentTokenAsync();
            if (!studentIds.Contains(dto.StudentId))
                if (!studentIds.Contains(dto.StudentId))
                {
                    return StatusCode(403, "Bạn không có quyền gửi thông tin cho học sinh này.");
                }


            var condition = new MedicalCondition
            {
                StudentId = dto.StudentId,
                ConditionType = dto.ConditionType,
                ConditionName = dto.ConditionName,
                Severity = dto.Severity,
                Description = dto.Description,
                DateReported = DateTime.Now
            };

            _context.MedicalConditions.Add(condition);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã khai báo hồ sơ sức khỏe cho học sinh." });
        }



        [HttpGet("medical-condition")]
        public async Task<IActionResult> GetMedicalConditions()
        {
            var studentIds = await GetStudentIdsFromParentTokenAsync();
            if (studentIds.Count == 0) return Ok(new List<MedicalConditionDTO>());

            var list = await _context.MedicalConditions
                .Where(c => studentIds.Contains(c.StudentId) && c.IsActive)
                .Select(c => new MedicalConditionDTO
                {
                    ConditionId = c.ConditionId,
                    ConditionType = c.ConditionType,
                    ConditionName = c.ConditionName,
                    Severity = c.Severity,
                    Description = c.Description,
                    StudentId = c.StudentId,
                    StudentName = _context.Students
                        .Where(s => s.StudentId == c.StudentId)
                        .Select(s => s.Name)
                        .FirstOrDefault()
                }).ToListAsync();
            return Ok(list);
        }

        

        [HttpPut("medical-condition/{id}")]
        public async Task<IActionResult> UpdateMedicalCondition(int id, [FromBody] MedicalConditionUpdateDTO dto)
        {
            var studentIds = await GetStudentIdsFromParentTokenAsync();
            var condition = await _context.MedicalConditions.FindAsync(id);

            if (condition == null)
                return NotFound(new { message = "Không tìm thấy tình trạng y tế." });

            if (!studentIds.Contains(condition.StudentId))
                return StatusCode(403, new { message = "Bạn không có quyền cập nhật." });


            condition.ConditionType = dto.ConditionType;
            condition.ConditionName = dto.ConditionName;
            condition.Severity = dto.Severity;
            condition.Description = dto.Description;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công." });
        }


        [HttpDelete("medical-condition/{id}")]
        public async Task<IActionResult> DeleteMedicalCondition(int id)
        {
            var studentIds = await GetStudentIdsFromParentTokenAsync();
            var condition = await _context.MedicalConditions.FindAsync(id);

            // Kiểm tra tồn tại TRƯỚC
            if (condition == null)
                return NotFound(new { message = "Không tìm thấy tình trạng y tế." });

            // Kiểm tra quyền SAU
            if (!studentIds.Contains(condition.StudentId))
                return StatusCode(403, new { message = "Bạn không có quyền xóa." });

            // Soft delete
            condition.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa tình trạng y tế khỏi hồ sơ." });
        }


        [HttpPost("medication")]
        public async Task<IActionResult> AddMedication([FromBody] MedicationCreateDTO dto)
        {
            var studentIds = await GetStudentIdsFromParentTokenAsync();
            if (!studentIds.Contains(dto.StudentId))
                return StatusCode(403, "Không có quyền gửi thuốc cho học sinh này.");

            var med = new Medication
            {
                StudentId = dto.StudentId,
                MedicationName = dto.MedicationName,
                Dosage = dto.Dosage,
                Frequency = dto.Frequency,
                Instructions = dto.Instructions,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                ProvidedByParent = true,
                Status = "Pending"
            };

            _context.Medications.Add(med);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Gửi thuốc thành công." });
        }

        [HttpGet("medications")]
        public async Task<IActionResult> GetMedications()
        {
            var parentId = int.Parse(User.FindFirstValue("UserId"));
            var studentIds = await GetStudentIdsFromParentTokenAsync();
            var list = await _svc.GetForParentAsync(parentId, studentIds);
            return Ok(list);
        }

        [HttpPut("medication/{id}")]
        public async Task<IActionResult> UpdateMedication(int id, [FromBody] MedicationUpdateDTO dto)
        {
            var parentId = int.Parse(User.FindFirstValue("UserId"));
            await _svc.UpdateByParentAsync(parentId, id, dto);
            return Ok(new { message = "Cập nhật thuốc thành công." });
        }



    }
}
