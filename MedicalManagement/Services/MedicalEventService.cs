using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using MedicalManagement.Exceptions;

namespace MedicalManagement.Services
{
    public class MedicalEventService : IMedicalEventService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notification;

        public MedicalEventService(AppDbContext context, INotificationService notification)
        {
            _context = context;
            _notification = notification;
        }


        public async Task<List<MedicalEventDTO>> GetAllAsync()
        {
            return await _context.MedicalEvents
                .Where(e => e.IsActive)
                .Select(e => new MedicalEventDTO
                {
                    EventId = e.EventId,
                    StudentId = e.StudentId,
                    StudentName = _context.Students
                        .Where(s => s.StudentId == e.StudentId)
                        .Select(s => s.Name)
                        .FirstOrDefault(),
                    EventType = e.EventType,
                    Description = e.Description,
                    Date = e.Date,
                    NurseName = _context.SchoolNurses
                        .Where(n => n.NurseId == e.NurseId)
                        .Select(n => n.Name)
                        .FirstOrDefault()
                }).ToListAsync();
        }

        public async Task<MedicalEventDTO> GetByIdAsync(int id)
        {
            var e = await _context.MedicalEvents.FirstOrDefaultAsync(ev => ev.EventId == id && ev.IsActive);
            if (e == null)
                throw new NotFoundException("Không tìm thấy sự kiện.");

            return new MedicalEventDTO
            {
                EventId = e.EventId,
                StudentId = e.StudentId,
                StudentName = await _context.Students
                    .Where(s => s.StudentId == e.StudentId)
                    .Select(s => s.Name)
                    .FirstOrDefaultAsync(),
                EventType = e.EventType,
                Description = e.Description,
                Date = e.Date,
                NurseName = await _context.SchoolNurses
                    .Where(n => n.NurseId == e.NurseId)
                    .Select(n => n.Name)
                    .FirstOrDefaultAsync()
            };
        }

        public async Task<int> CreateAsync(MedicalEventCreateDTO dto, int nurseId)
        {
            var student = await _context.Students.FindAsync(dto.StudentId);
            if (student == null)
                throw new NotFoundException("Học sinh không tồn tại.");

            var newEvent = new MedicalEvent
            {
                StudentId = dto.StudentId,
                EventType = dto.EventType,
                Description = dto.Description,
                Severity = dto.Severity,
                TreatmentGiven = dto.TreatmentGiven,
                ParentNotified = dto.ParentNotified,
                FollowUpRequired = dto.FollowUpRequired,
                Location = dto.Location,
                Date = DateTime.Now,
                NurseId = nurseId,
                IsActive = true
            };

            _context.MedicalEvents.Add(newEvent);

            if (dto.ParentNotified && dto.FollowUpRequired)
                throw new BadRequestException("Chỉ được chọn hoặc 'ParentNotified' hoặc 'FollowUpRequired', không cùng lúc.");


            // Nếu cần gửi thông báo đơn giản cho phụ huynh
            if (dto.ParentNotified)
            {
                await _notification.SendToParentAsync(
                    dto.StudentId,
                    "Thông báo sự kiện y tế",
                    $"Học sinh {student.Name} gặp sự kiện y tế: {dto.EventType}.",
                    "MedicalEvent"
                );
            }

            // Nếu cần tư vấn → tạo lịch hẹn + thông báo
            else if (dto.FollowUpRequired)
            {
                var appointment = new Appointment
                {
                    StudentId = dto.StudentId,
                    ParentId = student.ParentId,
                    NurseId = nurseId,
                    AppointmentDate = DateTime.Now.AddDays(1),
                    Reason = $"Tư vấn sau sự kiện y tế: {dto.EventType}",
                    Status = "Pending",
                    CreatedDate = DateTime.Now
                };

                _context.Appointments.Add(appointment);

                await _notification.SendToParentAsync(
                    dto.StudentId,
                    "Lịch tư vấn sau sự kiện y tế",
                    $"Học sinh {student.Name} cần được tư vấn sau sự kiện {dto.EventType}. Vui lòng kiểm tra lịch hẹn.",
                    "Appointment"
                );
            }

            await _context.SaveChangesAsync();
            return newEvent.EventId;
        }


        public async Task UpdateAsync(int id, MedicalEventUpdateDTO dto)
        {
            var ev = await _context.MedicalEvents.FindAsync(id);
            if (ev == null || !ev.IsActive)
                throw new NotFoundException("Không tìm thấy sự kiện.");

            ev.EventType = dto.EventType;
            ev.Description = dto.Description;
            ev.Severity = dto.Severity;
            ev.TreatmentGiven = dto.TreatmentGiven;
            ev.Location = dto.Location;

            await _context.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int id)
        {
            var ev = await _context.MedicalEvents.FindAsync(id);
            if (ev == null || !ev.IsActive)
                throw new NotFoundException("Không tìm thấy sự kiện.");

            ev.IsActive = false;
            await _context.SaveChangesAsync();
        }
    }
}
