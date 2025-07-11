using MedicalManagement.Data;
using MedicalManagement.Exceptions;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class AssignmentService : IAssignmentService
    {
        private readonly AppDbContext _context;

        public AssignmentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task AssignNurseAsync(AssignmentDTO dto)
        {
            var plan = await _context.MedicalPlans.FindAsync(dto.PlanId)
                ?? throw new NotFoundException("Không tìm thấy kế hoạch.");

            var nurse = await _context.SchoolNurses.FindAsync(dto.NurseId)
                ?? throw new NotFoundException("Không tìm thấy nhân viên y tế.");

            // Kiểm tra trước các học sinh không đủ điều kiện
            var invalidStudents = new List<(int Id, string Name)>();

            foreach (var studentId in dto.StudentIds)
            {
                var consent = await _context.Consents
                    .FirstOrDefaultAsync(c => c.StudentId == studentId
                        && c.ReferenceId == dto.PlanId
                        && c.ConsentType == plan.PlanType);

                if (consent == null || consent.ConsentStatus != "Approved")
                {
                    var studentName = await _context.Students
                        .Where(s => s.StudentId == studentId)
                        .Select(s => s.Name)
                        .FirstOrDefaultAsync() ?? "(Không tìm thấy tên)";
                    invalidStudents.Add((studentId, studentName));
                }
            }

            if (invalidStudents.Any())
            {
                throw new InvalidOperationException(
                    $"Không thể phân công. Các học sinh sau chưa đồng ý tham gia kế hoạch: " +
                    $"{string.Join(", ", invalidStudents.Select(s => $"[{s.Id}] {s.Name}"))}");
            }


            // Nếu tất cả đều hợp lệ → tiếp tục phân công
            foreach (var studentId in dto.StudentIds)
            {
                bool exists;
                if (plan.PlanType == "Vaccination")
                {
                    exists = await _context.Vaccinations.AnyAsync(v => v.PlanId == dto.PlanId && v.StudentId == studentId);
                    if (!exists)
                    {
                        _context.Vaccinations.Add(new Vaccination
                        {
                            PlanId = dto.PlanId,
                            StudentId = studentId,
                            NurseId = dto.NurseId,
                            Date = DateTime.MinValue
                        });
                    }
                }
                else if (plan.PlanType == "Health_Checkup")
                {
                    exists = await _context.HealthCheckups.AnyAsync(h => h.PlanId == dto.PlanId && h.StudentId == studentId);
                    if (!exists)
                    {
                        _context.HealthCheckups.Add(new HealthCheckup
                        {
                            PlanId = dto.PlanId,
                            StudentId = studentId,
                            NurseId = dto.NurseId,
                            Date = DateTime.MinValue
                        });
                    }
                }
                else
                {
                    throw new InvalidOperationException("Loại kế hoạch không hợp lệ.");
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<ConsentedStudentDTO>> GetAllConsentedStudentsAsync()
        {
            var approvedConsents = _context.Consents
                .Where(c => c.ConsentStatus == "Approved");

            var students = await approvedConsents
                .Join(_context.Students,
                      c => c.StudentId,
                      s => s.StudentId,
                      (c, s) => new ConsentedStudentDTO
                      {
                          StudentId = s.StudentId,
                          Name = s.Name,
                          Class = s.Class,
                          ParentId = s.ParentId
                      })
                .Distinct()
                .ToListAsync();

            return students;
        }


        public async Task<List<ConsentedStudentDTO>> GetConsentedStudentsAsync(int planId)
        {
            var plan = await _context.MedicalPlans.FindAsync(planId);
            if (plan == null)
                throw new NotFoundException("Không tìm thấy kế hoạch.");

            var approvedConsents = _context.Consents
                .Where(c => c.ReferenceId == planId
                            && c.ConsentType == plan.PlanType
                            && c.ConsentStatus == "Approved");

            var assignedStudentIds = plan.PlanType switch
            {
                "Vaccination" => await _context.Vaccinations
                                    .Where(v => v.PlanId == planId)
                                    .Select(v => v.StudentId)
                                    .ToListAsync(),
                "Health_Checkup" => await _context.HealthCheckups
                                        .Where(h => h.PlanId == planId)
                                        .Select(h => h.StudentId)
                                        .ToListAsync(),
                _ => throw new InvalidOperationException("Loại kế hoạch không hợp lệ.")
            };

            var consentedStudents = await approvedConsents
                .Where(c => !assignedStudentIds.Contains(c.StudentId)) // <-- lọc học sinh chưa phân công
                .Join(_context.Students,
                      c => c.StudentId,
                      s => s.StudentId,
                      (c, s) => new ConsentedStudentDTO
                      {
                          StudentId = s.StudentId,
                          Name = s.Name,
                          Class = s.Class,
                          ParentId = s.ParentId
                      })
                .ToListAsync();

            return consentedStudents;
        }


    }
}

