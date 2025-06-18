using MedicalManagement.Data;
using MedicalManagement.Exceptions;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class HealthCheckupService : IHealthCheckupService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notification;

        public HealthCheckupService(AppDbContext context, INotificationService notification)
        {
            _context = context;
            _notification = notification;
        }

        public async Task<List<HealthCheckupReadDTO>> GetAllAsync()
        {
            return await _context.HealthCheckups
                .Include(h => h.Student)
                .Select(h => new HealthCheckupReadDTO
                {
                    CheckupId = h.CheckupId,
                    StudentName = h.Student.Name,
                    CheckupType = h.CheckupType,
                    Result = h.Result,
                    AbnormalFindings = h.AbnormalFindings,
                    Recommendations = h.Recommendations,
                    Date = h.Date
                }).ToListAsync();
        }

        public async Task<int> CreateAsync(HealthCheckupCreateDTO dto, int nurseId)
        {
            var student = await _context.Students.FindAsync(dto.StudentId)
                ?? throw new NotFoundException("Học sinh không tồn tại.");

            var plan = await _context.MedicalPlans.FindAsync(dto.PlanId);
            if (plan == null)
                throw new NotFoundException("Không tìm thấy kế hoạch kiểm tra sức khỏe định kỳ.");

            var checkup = new HealthCheckup
            {
                StudentId = dto.StudentId,
                PlanId = dto.PlanId,
                CheckupType = dto.CheckupType,
                Result = dto.Result,
                AbnormalFindings = dto.AbnormalFindings,
                Recommendations = dto.Recommendations,
                Date = DateTime.Now,
                NurseId = nurseId,
                FollowUpRequired = dto.FollowUpRequired
            };

            _context.HealthCheckups.Add(checkup);
            await _context.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(dto.AbnormalFindings) || dto.FollowUpRequired == true)
            {
                var appointment = new Appointment
                {
                    StudentId = dto.StudentId,
                    ParentId = student.ParentId,
                    NurseId = nurseId,
                    AppointmentDate = DateTime.Now.AddDays(1),
                    Reason = "Tư vấn sau khám sức khỏe định kỳ",
                    Status = "Pending",
                    CreatedDate = DateTime.Now
                };

                _context.Appointments.Add(appointment);

                await _notification.SendToParentAsync(dto.StudentId,
                    "Lịch tư vấn sau khám sức khỏe",
                    $"Học sinh {student.Name} có dấu hiệu bất thường trong lần khám vừa rồi. Đã lên lịch tư vấn.",
                    "Appointment");
            }


            return checkup.CheckupId;
        }

        public async Task UpdateAsync(int id, HealthCheckupUpdateDTO dto, int nurseId)
        {
            var checkup = await _context.HealthCheckups.FindAsync(id)
                ?? throw new NotFoundException("Không tìm thấy kết quả khám.");

            checkup.Result = dto.Result ?? checkup.Result;
            checkup.AbnormalFindings = dto.AbnormalFindings ?? checkup.AbnormalFindings;
            checkup.Recommendations = dto.Recommendations ?? checkup.Recommendations;
            checkup.FollowUpRequired = dto.FollowUpRequired ?? checkup.FollowUpRequired;

            await _context.SaveChangesAsync();
        }
    }

}
