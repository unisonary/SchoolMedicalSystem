using MedicalManagement.Data;
using MedicalManagement.Exceptions;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notification;

        public AppointmentService(AppDbContext context, INotificationService notification)
        {
            _context = context;
            _notification = notification;
        }

        public async Task<List<AppointmentReadDTO>> GetAllAsync(string? status = null)
        {
            var query = _context.Appointments
                .Include(a => a.Student)
                .Include(a => a.Student.Parent)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(a => a.Status == status);

            return await query
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => new AppointmentReadDTO
                {
                    AppointmentId = a.AppointmentId,
                    StudentName = a.Student.Name,
                    ParentName = a.Student.Parent.Name,
                    AppointmentDate = a.AppointmentDate,
                    Reason = a.Reason,
                    Status = a.Status,
                    Notes = a.Notes
                }).ToListAsync();
        }

        public async Task UpdateAsync(int id, AppointmentUpdateDTO dto, int nurseId)
        {
            var app = await _context.Appointments.FindAsync(id);
            if (app == null) throw new NotFoundException("Lịch hẹn không tồn tại.");

            app.Status = dto.Status ?? app.Status;
            app.Notes = dto.Notes ?? app.Notes;
            app.AppointmentDate = dto.AppointmentDate ?? app.AppointmentDate;
            app.NurseId = nurseId;

            await _context.SaveChangesAsync();
        }

        public async Task CreateAsync(AppointmentCreateDTO dto, int nurseId)
        {
            var student = await _context.Students.Include(s => s.Parent).FirstOrDefaultAsync(s => s.StudentId == dto.StudentId);
            if (student == null || student.ParentId == null)
                throw new NotFoundException("Học sinh hoặc phụ huynh không tồn tại.");

            var appointment = new Appointment
            {
                StudentId = dto.StudentId,
                ParentId = student.ParentId,
                NurseId = nurseId,
                AppointmentDate = dto.AppointmentDate,
                Reason = dto.Reason,
                Status = "Pending",
                CreatedDate = DateTime.Now
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            // Gửi thông báo
            await _notification.SendToParentAsync(dto.StudentId,
                "Lịch hẹn tư vấn y tế",
                $"Học sinh {student.Name} có lịch hẹn tư vấn ngày {dto.AppointmentDate:dd/MM/yyyy} do có dấu hiệu bất thường sau kiểm tra.",
                "Appointment");
        }
    }

}
