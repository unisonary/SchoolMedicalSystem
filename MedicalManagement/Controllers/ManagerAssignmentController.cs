using MedicalManagement.Exceptions;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedicalManagement.Data;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/manager/assignments")]
    [Authorize(Roles = "Manager")]
    public class ManagerAssignmentController : ControllerBase
    {
        private readonly IAssignmentService _service;
        private readonly IConsentService _consentService;
        private readonly AppDbContext _context;

        public ManagerAssignmentController(IAssignmentService service, IConsentService consentService, AppDbContext context)
        {
            _service = service;
            _consentService = consentService;
            _context = context;
        }

        [HttpGet("consented-students/all")]
        public async Task<IActionResult> GetAllConsentedStudents()
        {
            try
            {
                var result = await _service.GetAllConsentedStudentsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", detail = ex.Message });
            }
        }


        [HttpGet("consented-students/{planId}")]
        public async Task<IActionResult> GetConsentedStudents(int planId)
        {
            try
            {
                var result = await _service.GetConsentedStudentsAsync(planId);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", detail = ex.Message });
            }
        }

        // ✅ Lấy danh sách y tá
        [HttpGet("/api/nurses")]
        public async Task<IActionResult> GetNurses()
        {
            var nurses = await _context.SchoolNurses
                .Select(n => new { nurseId = n.NurseId, name = n.Name })
                .ToListAsync();

            return Ok(nurses);
        }

        [HttpPost]
        public async Task<IActionResult> Assign([FromBody] AssignmentDTO dto)
        {
            await _service.AssignNurseAsync(dto);
            return Ok(new { message = "Đã phân công y tá." });
        }

        // ✅ Consent Management Endpoints
        [HttpGet("consents/{planId}")]
        public async Task<IActionResult> GetConsentsByPlan(int planId)
        {
            try
            {
                var result = await _consentService.GetAllConsentsByPlanAsync(planId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", detail = ex.Message });
            }
        }

        [HttpGet("consents/denied")]
        public async Task<IActionResult> GetDeniedConsents([FromQuery] int? planId = null)
        {
            try
            {
                var result = await _consentService.GetDeniedConsentsAsync(planId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", detail = ex.Message });
            }
        }

        [HttpGet("consents/email-denied")]
        public async Task<IActionResult> GetEmailDeniedConsents([FromQuery] int? planId = null)
        {
            try
            {
                var result = await _consentService.GetEmailDeniedConsentsAsync(planId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", detail = ex.Message });
            }
        }

        [HttpGet("denied-students/{planId}")]
        public async Task<IActionResult> GetDeniedStudentsByPlan(int planId)
        {
            try
            {
                // Debug log
                Console.WriteLine($"[DEBUG] GetDeniedStudentsByPlan called with planId: {planId}");
                
                var result = await _consentService.GetDeniedStudentsByPlanAsync(planId);
                
                Console.WriteLine($"[DEBUG] Found {result.Count} denied students for plan {planId}");
                
                // Phân nhóm theo lớp để frontend dễ hiển thị
                var groupedByClass = result.GroupBy(s => s.StudentClass)
                    .Select(g => new {
                        className = g.Key,
                        studentCount = g.Count(),
                        students = g.ToList()
                    })
                    .OrderBy(g => g.className)
                    .ToList();
                
                return Ok(new {
                    planId = planId,
                    totalDenied = result.Count,
                    emailDenied = result.Count(s => s.IsEmailDenied),
                    appDenied = result.Count(s => !s.IsEmailDenied),
                    groupedByClass = groupedByClass,
                    allStudents = result
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetDeniedStudentsByPlan: {ex.Message}");
                Console.WriteLine($"[ERROR] Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { 
                    message = "Lỗi server", 
                    detail = ex.Message,
                    stackTrace = ex.StackTrace 
                });
            }
        }

        // ✅ Test endpoint để kiểm tra dữ liệu
        [HttpGet("test-consents/{planId}")]
        public async Task<IActionResult> TestConsents(int planId)
        {
            try
            {
                var allConsents = await _context.Consents
                    .Where(c => c.ReferenceId == planId)
                    .Select(c => new { 
                        c.ConsentId, 
                        c.ConsentStatus, 
                        c.StudentId,
                        c.Notes,
                        c.ConsentDate 
                    })
                    .ToListAsync();
                
                return Ok(new { 
                    planId = planId,
                    totalConsents = allConsents.Count,
                    consents = allConsents
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi test", detail = ex.Message });
            }
        }

        // ✅ Test endpoint để kiểm tra danh sách students và class
        [HttpGet("test-students")]
        public async Task<IActionResult> TestStudents()
        {
            try
            {
                var students = await _context.Students
                    .Select(s => new { 
                        s.StudentId, 
                        s.Name, 
                        s.Class,
                        s.ParentId
                    })
                    .Take(10)
                    .ToListAsync();
                
                return Ok(new { 
                    totalStudents = students.Count,
                    students = students
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi test students", detail = ex.Message });
            }
        }

        // ✅ Tạo test data nhanh (chỉ để debug)
        [HttpPost("create-test-denial/{planId}/{studentId}")]
        public async Task<IActionResult> CreateTestDenial(int planId, int studentId, [FromQuery] string? className = null)
        {
            try
            {
                // Kiểm tra xem đã có consent chưa
                var existingConsent = await _context.Consents
                    .FirstOrDefaultAsync(c => c.ReferenceId == planId && c.StudentId == studentId);

                if (existingConsent != null)
                {
                    // Update existing consent to denied
                    existingConsent.ConsentStatus = "Email_Denied";
                    existingConsent.ConsentDate = DateTime.Now;
                    existingConsent.Notes = "Tôi không đồng ý cho con tham gia vào kế hoạch khám sức khỏe định kỳ (Phản hồi qua email - lý do chi tiết có thể được cập nhật qua App hoặc bởi nhà trường)";
                }
                else
                {
                    // Tạo consent mới
                    var student = await _context.Students.FindAsync(studentId);
                    if (student == null)
                        return BadRequest("Student không tồn tại");

                    // Update class nếu được cung cấp và student chưa có class
                    if (!string.IsNullOrEmpty(className) && string.IsNullOrEmpty(student.Class))
                    {
                        student.Class = className;
                    }

                    _context.Consents.Add(new Consent
                    {
                        StudentId = studentId,
                        ParentId = student.ParentId,
                        ConsentType = "Health_Checkup",
                        ReferenceId = planId,
                        ConsentStatus = "Email_Denied",
                        ConsentDate = DateTime.Now,
                        RequestedDate = DateTime.Now,
                        Notes = "Tôi không đồng ý cho con tham gia vào kế hoạch khám sức khỏe định kỳ (Phản hồi qua email - lý do chi tiết có thể được cập nhật qua App hoặc bởi nhà trường)"
                    });
                }

                await _context.SaveChangesAsync();
                
                // Lấy thông tin student để trả về
                var studentInfo = await _context.Students.FindAsync(studentId);
                return Ok(new { 
                    message = "Đã tạo test data", 
                    planId, 
                    studentId,
                    studentName = studentInfo?.Name,
                    studentClass = studentInfo?.Class ?? "Chưa phân lớp"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi tạo test data", detail = ex.Message });
            }
        }

        [HttpPut("consents/{consentId}/notes")]
        public async Task<IActionResult> UpdateConsentNotes(int consentId, [FromBody] ConsentNotesUpdateDTO dto)
        {
            try
            {
                await _consentService.UpdateConsentNotesAsync(consentId, dto.Notes);
                return Ok(new { message = "Đã cập nhật lý do từ chối." });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", detail = ex.Message });
            }
        }
    }
}
