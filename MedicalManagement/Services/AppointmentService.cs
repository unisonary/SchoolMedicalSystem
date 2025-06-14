using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using MedicalManagement.Models.Entities;

public class AppointmentService : IAppointmentService
{
    private readonly AppDbContext _context;

    public AppointmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task CreateAppointmentAsync(int parentId, AppointmentCreateDTO dto)
    {
        var student = await _context.Students.FirstOrDefaultAsync(s => s.StudentId == dto.StudentId);

        if (student == null || student.ParentId != parentId)
            throw new UnauthorizedAccessException("Không thể đặt lịch cho học sinh này.");

        if (!student.FollowUpRequired)
            throw new InvalidOperationException("Học sinh không yêu cầu theo dõi thêm.");

        var appointment = new Appointment
        {
            StudentId = dto.StudentId,
            ParentId = parentId,
            NurseId = null, // sẽ được chỉ định sau
            ScheduledDate = dto.ScheduledDate,
            Reason = dto.Reason,
            Status = "Pending"
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
    }

    public async Task<List<AppointmentReadDTO>> GetAppointmentsAsync(int parentId)
    {
        var appointments = await _context.Appointments
            .Where(a => a.ParentId == parentId)
            .OrderByDescending(a => a.ScheduledDate)
            .ToListAsync();

        var result = appointments.Select(a => new AppointmentReadDTO
        {
            AppointmentId = a.AppointmentId,
            StudentName = _context.Students.Where(s => s.StudentId == a.StudentId).Select(s => s.Name).FirstOrDefault(),
            NurseName = a.NurseId != null ? _context.SchoolNurses.Where(n => n.NurseId == a.NurseId).Select(n => n.Name).FirstOrDefault() : "(Đang xử lý)",
            ScheduledDate = a.ScheduledDate,
            Reason = a.Reason,
            Status = a.Status
        }).ToList();

        return result;
    }
}