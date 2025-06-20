using MedicalManagement.Data;
using MedicalManagement.Exceptions;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class MedicalPlanService : IMedicalPlanService
    {
        private readonly AppDbContext _context;

        public MedicalPlanService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int> CreateAsync(MedicalPlanCreateDTO dto, int managerId)
        {
            var plan = new MedicalPlan
            {
                ManagerId = managerId,
                PlanType = dto.PlanType,
                PlanName = dto.PlanName,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                TargetGrade = dto.TargetGrade,
                Status = "Planned",
                CreatedDate = DateTime.Now
            };

            _context.MedicalPlans.Add(plan);
            await _context.SaveChangesAsync();

            // Gửi consent đến phụ huynh
            var students = await _context.Students
                .Where(s => s.Class == dto.TargetGrade && s.ParentId != null)
                .ToListAsync();

            foreach (var student in students)
            {
                _context.Consents.Add(new Consent
                {
                    StudentId = student.StudentId,
                    ParentId = student.ParentId!,
                    ConsentType = dto.PlanType,
                    ReferenceId = plan.PlanId,
                    ConsentStatus = "Pending",
                    RequestedDate = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();
            return plan.PlanId;
        }

        public async Task<List<MedicalPlanReadDTO>> GetAllAsync()
        {
            return await _context.MedicalPlans
                .Select(p => new MedicalPlanReadDTO
                {
                    PlanId = p.PlanId,
                    PlanType = p.PlanType,
                    PlanName = p.PlanName,
                    Description = p.Description,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    TargetGrade = p.TargetGrade,
                    Status = p.Status,
                    CreatedDate = p.CreatedDate
                }).ToListAsync();
        }

        public async Task UpdateAsync(int id, MedicalPlanUpdateDTO dto)
        {
            var plan = await _context.MedicalPlans.FindAsync(id)
                ?? throw new NotFoundException("Không tìm thấy kế hoạch.");

            bool gradeChanged = plan.TargetGrade != dto.TargetGrade;
            string originalGrade = plan.TargetGrade;

            plan.PlanType = dto.PlanType;
            plan.PlanName = dto.PlanName;
            plan.Description = dto.Description;
            plan.StartDate = dto.StartDate;
            plan.EndDate = dto.EndDate;
            plan.TargetGrade = dto.TargetGrade;
            plan.Status = dto.Status;

            if (gradeChanged)
            {
                var oldConsents = await _context.Consents
                    .Where(c => c.ReferenceId == id && c.ConsentType == dto.PlanType)
                    .ToListAsync();
                _context.Consents.RemoveRange(oldConsents);

                var students = await _context.Students
                    .Where(s => s.Class == dto.TargetGrade && s.ParentId != null)
                    .ToListAsync();

                foreach (var student in students)
                {
                    _context.Consents.Add(new Consent
                    {
                        StudentId = student.StudentId,
                        ParentId = student.ParentId!,
                        ConsentType = dto.PlanType,
                        ReferenceId = plan.PlanId,
                        ConsentStatus = "Pending",
                        RequestedDate = DateTime.Now
                    });
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var plan = await _context.MedicalPlans.FindAsync(id)
                ?? throw new NotFoundException("Không tìm thấy kế hoạch.");

            // Xoá consent liên quan
            var consents = await _context.Consents
                .Where(c => c.ReferenceId == id)
                .ToListAsync();
            _context.Consents.RemoveRange(consents);

            // Xoá dữ liệu liên quan trong HealthCheckup hoặc Vaccination
            if (plan.PlanType == "Health_Checkup")
            {
                var checkups = await _context.HealthCheckups
                    .Where(h => h.PlanId == id)
                    .ToListAsync();
                _context.HealthCheckups.RemoveRange(checkups);
            }
            else if (plan.PlanType == "Vaccination")
            {
                var vaccinations = await _context.Vaccinations
                    .Where(v => v.PlanId == id)
                    .ToListAsync();
                _context.Vaccinations.RemoveRange(vaccinations);
            }

            // Cuối cùng, xoá kế hoạch
            _context.MedicalPlans.Remove(plan);
            await _context.SaveChangesAsync();
        }
    
    }
}
