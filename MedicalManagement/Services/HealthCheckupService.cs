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

        public async Task<List<HealthCheckupReadDTO>> GetByPlanIdAsync(int planId)
        {
            return await _context.HealthCheckups
                .Where(h => h.PlanId == planId)
                .Include(h => h.Student)
                .Select(h => new HealthCheckupReadDTO
                {
                    CheckupId = h.CheckupId,
                    StudentName = h.Student.Name ?? "(Không rõ)",
                    CheckupType = h.CheckupType ?? "",
                    Result = h.Result ?? "",
                    AbnormalFindings = h.AbnormalFindings ?? "",
                    Recommendations = h.Recommendations ?? "",
                    Date = h.Date
                }).ToListAsync();
        }

        public async Task UpdateAsync(int id, HealthCheckupUpdateDTO dto, int nurseId)
        {
            var checkup = await _context.HealthCheckups.FindAsync(id)
                ?? throw new NotFoundException("Không tìm thấy kết quả khám.");

            // Cập nhật thông tin
            checkup.CheckupType = dto.CheckupType ?? checkup.CheckupType;
            checkup.Result = dto.Result ?? checkup.Result;
            checkup.AbnormalFindings = dto.AbnormalFindings ?? checkup.AbnormalFindings;
            checkup.Recommendations = dto.Recommendations ?? checkup.Recommendations;
            checkup.FollowUpRequired = dto.FollowUpRequired ?? checkup.FollowUpRequired;
            checkup.Date = DateTime.Now;

            await _context.SaveChangesAsync();

            var student = await _context.Students.FindAsync(checkup.StudentId);
            if (student?.ParentId != null)
            {
                if (checkup.FollowUpRequired)
                {
                    // Cần theo dõi thêm → tạo lịch hẹn
                    var appointment = new Appointment
                    {
                        StudentId = checkup.StudentId,
                        ParentId = student.ParentId,
                        NurseId = nurseId,
                        AppointmentDate = DateTime.Now.AddDays(1),
                        Reason = "Tư vấn sau khám sức khỏe định kỳ",
                        Status = "Pending",
                        CreatedDate = DateTime.Now
                    };

                    _context.Appointments.Add(appointment);

                    await _notification.SendToParentAsync(
                        checkup.StudentId,
                        "Cảnh báo sức khỏe",
                        $"Học sinh {student.Name} có kết quả khám: {checkup.Result}. Cần theo dõi thêm. Hệ thống đã lên lịch tư vấn.",
                        "Appointment"
                    );
                }
                else
                {
                    // Bình thường → chỉ thông báo kết quả
                    await _notification.SendToParentAsync(
                        checkup.StudentId,
                        "Kết quả khám sức khỏe",
                        $"Học sinh {student.Name} đã được khám sức khỏe: {checkup.Result}. Khuyến nghị: {checkup.Recommendations}.",
                        "Health_Checkup"
                    );
                }

                await _context.SaveChangesAsync();
            }
        }


    }

}
