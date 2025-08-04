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

        // =================================================================
        // HÀM HỖ TRỢ ĐƯỢC CHUẨN HÓA
        // =================================================================
        private async Task<(int? parentId, List<int> studentIds)> GetParentInfoFromTokenAsync()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(username))
            {
                return (null, new List<int>());
            }

            var user = await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.Username == username && u.Role == "Parent");

            if (user?.ReferenceId == null)
            {
                return (null, new List<int>());
            }

            var studentIds = await _context.Students
                .Where(s => s.ParentId == user.ReferenceId)
                .Select(s => s.StudentId)
                .ToListAsync();

            return (user.ReferenceId, studentIds);
        }

        // =================================================================
        // CÁC API ĐÃ SỬA LẠI ĐỂ DÙNG HÀM HỖ TRỢ NHẤT QUÁN
        // =================================================================

        [HttpGet("students")]
        public async Task<IActionResult> GetMyStudents()
        {
            var (parentId, _) = await GetParentInfoFromTokenAsync();
            if (parentId == null) return Unauthorized();

            var students = await _context.Students
                .Where(s => s.ParentId == parentId)
                .Select(s => new {
                    s.StudentId,
                    s.Name,
                    s.Class,
                    s.DateOfBirth
                }).ToListAsync();

            return Ok(students);
        }

        [HttpPost("medical-condition")]
        public async Task<IActionResult> AddMedicalCondition([FromBody] MedicalConditionCreateDTO dto)
        {
            var (_, studentIds) = await GetParentInfoFromTokenAsync();
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
                DateReported = DateTime.Now,
                IsActive = true
            };

            _context.MedicalConditions.Add(condition);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã khai báo hồ sơ sức khỏe cho học sinh." });
        }

        [HttpGet("medical-condition")]
        public async Task<IActionResult> GetMedicalConditions()
        {
            var (_, studentIds) = await GetParentInfoFromTokenAsync();
            if (!studentIds.Any()) return Ok(new List<MedicalConditionDTO>());

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
            var (_, studentIds) = await GetParentInfoFromTokenAsync();
            var condition = await _context.MedicalConditions.FindAsync(id);

            if (condition == null) return NotFound(new { message = "Không tìm thấy tình trạng y tế." });
            if (!studentIds.Contains(condition.StudentId)) return StatusCode(403, new { message = "Bạn không có quyền cập nhật." });

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
            var (_, studentIds) = await GetParentInfoFromTokenAsync();
            var condition = await _context.MedicalConditions.FindAsync(id);

            if (condition == null) return NotFound(new { message = "Không tìm thấy tình trạng y tế." });
            if (!studentIds.Contains(condition.StudentId)) return StatusCode(403, new { message = "Bạn không có quyền xóa." });

            condition.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa tình trạng y tế khỏi hồ sơ." });
        }

        // === API GỬI THUỐC ĐÃ SỬA LỖI ===
        [HttpPost("medication")]
        public async Task<IActionResult> AddMedication([FromBody] MedicationCreateDTO dto)
        {
            var (_, studentIds) = await GetParentInfoFromTokenAsync();
            if (!studentIds.Any()) return Unauthorized("Token không hợp lệ.");

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
                PrescriptionImageUrl = dto.PrescriptionImageUrl,
                Status = "PendingConfirmation"
            };

            _context.Medications.Add(med);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Gửi yêu cầu thành công. Vui lòng chờ y tá xác nhận." });
        }

        [HttpGet("medications")]
        public async Task<IActionResult> GetMedications()
        {
            var (parentId, studentIds) = await GetParentInfoFromTokenAsync();
            if (parentId == null) return Unauthorized();

            // Giả sử service GetForParentAsync cần parentId và studentIds
            // Nếu service của bạn chỉ cần studentIds, bạn có thể bỏ parentId.Value
            var list = await _svc.GetForParentAsync(parentId.Value, studentIds);
            return Ok(list);
        }

        [HttpPut("medication/{id}")]
        public async Task<IActionResult> UpdateMedication(int id, [FromBody] MedicationUpdateDTO dto)
        {
            var (parentId, studentIds) = await GetParentInfoFromTokenAsync();
            if (parentId == null) return Unauthorized();

            // Cần kiểm tra xem medication này có thuộc về học sinh của phụ huynh không
            var medication = await _context.Medications.FindAsync(id);
            if (medication == null) return NotFound();
            if (!studentIds.Contains(medication.StudentId)) return Forbid();

            await _svc.UpdateByParentAsync(parentId.Value, id, dto);
            return Ok(new { message = "Cập nhật thuốc thành công." });
        }
    }
}
