using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using MedicalManagement.Exceptions;
using MedicalManagement.Helpers;

namespace MedicalManagement.Services
{
    public class MedicalEventService : IMedicalEventService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notification;
        private readonly EmailService _emailService;
        private readonly IAuthService _authService;


        public MedicalEventService(
            AppDbContext context,
            INotificationService notification,
            EmailService emailService,
            IAuthService authService
        )
        {
            _context = context;
            _notification = notification;
            _emailService = emailService;
            _authService = authService;
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
                        .FirstOrDefault(),
                    Location = e.Location,
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
                    .FirstOrDefaultAsync(),
                Location = e.Location

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

                // Gửi email nếu có tài khoản phụ huynh
                var parentAccount = await _context.UserAccounts
                    .FirstOrDefaultAsync(u => u.Role == "Parent" && u.ReferenceId == student.ParentId);

                if (parentAccount != null)
                {
                    var email = await _authService.GetEmailByUser(parentAccount);
                    if (!string.IsNullOrEmpty(email))
                    {
                        var subject = $"📢 Thông báo sự kiện y tế liên quan đến học sinh {student.Name}";

                        var body = $@"
                            <html>
                            <body style=""font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;"">
                                <table style=""max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);"">
                                    <tr style=""background-color: #007bff; color: white;"">
                                        <td style=""padding: 20px;"">
                                            <h2>📢 Thông Báo Sự Kiện Y Tế</h2>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style=""padding: 30px;"">
                                            <p>Kính gửi Quý Phụ huynh,</p>
                                            <p>Chúng tôi xin thông báo rằng học sinh <strong>{student.Name}</strong> vừa gặp phải một sự kiện y tế tại trường.</p>
                                            <ul style=""color: #333;"">
                                                <li><strong>Loại sự kiện:</strong> {dto.EventType}</li>
                                                <li><strong>Ngày:</strong> {DateTime.Now:dd/MM/yyyy}</li>
                                                <li><strong>Vị trí:</strong> {dto.Location}</li>
                                                <li><strong>Chi tiết:</strong> {dto.Description}</li>
                                                {(string.IsNullOrEmpty(dto.TreatmentGiven) ? "" : $"<li><strong>Xử lý:</strong> {dto.TreatmentGiven}</li>")}
                                            </ul>
                                            <p>Chúng tôi đã xử lý kịp thời và đảm bảo sức khoẻ cho học sinh. Nếu Quý Phụ huynh có bất kỳ thắc mắc nào, vui lòng liên hệ với nhà trường để được hỗ trợ thêm.</p>
                                            <p>Trân trọng,</p>
                                            <p>📞 Trường Tiểu học FPT<br>Email: fptschoolhealthcare_swpproject@gmail.com<br>Điện thoại: 0764023678</p>
                                        </td>
                                    </tr>
                                </table>
                            </body>
                            </html>";

                        await _emailService.SendEmailAsync(email, subject, body);
                    }
                }
            }


            // Nếu cần tư vấn → tạo lịch hẹn + thông báo
            else if (dto.FollowUpRequired)
            {
                var appointmentDate = DateTime.Now.AddDays(1);
                var appointment = new Appointment
                {
                    StudentId = dto.StudentId,
                    ParentId = student.ParentId,
                    NurseId = nurseId,
                    AppointmentDate = appointmentDate,
                    Reason = $"Tư vấn sau sự kiện y tế: {dto.EventType}",
                    Status = "Pending",
                    CreatedDate = DateTime.Now
                };

                _context.Appointments.Add(appointment);

                // Gửi thông báo trong app
                await _notification.SendToParentAsync(
                    dto.StudentId,
                    "Lịch tư vấn sau sự kiện y tế",
                    $"Học sinh {student.Name} cần được tư vấn sau sự kiện {dto.EventType}. Vui lòng kiểm tra lịch hẹn.",
                    "Appointment"
                );

                // Gửi email lịch hẹn
                var parentAccount = await _context.UserAccounts
                    .FirstOrDefaultAsync(u => u.Role == "Parent" && u.ReferenceId == student.ParentId);

                if (parentAccount != null)
                {
                    var email = await _authService.GetEmailByUser(parentAccount);
                    if (!string.IsNullOrEmpty(email))
                    {
                        var subject = $"📅 Lịch hẹn tư vấn cho học sinh {student.Name}";

                        var body = $@"
                            <html>
                            <body style=""font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;"">
                                <table style=""max-width: 600px; margin: auto; background-color: white; padding: 30px; border-radius: 8px;"">
                                    <tr>
                                        <td>
                                            <h2 style=""color: #2b6cb0;"">🩺 Lịch Tư Vấn Sau Sự Kiện Y Tế</h2>
                                            <p>Kính gửi Quý Phụ huynh của em <strong>{student.Name}</strong>,</p>
                                            <p>Học sinh vừa gặp một sự kiện y tế và nhà trường đã lên lịch tư vấn nhằm trao đổi và theo dõi thêm.</p>

                                            <ul style=""line-height: 1.6;"">
                                                <li><strong>Loại sự kiện:</strong> {dto.EventType}</li>
                                                <li><strong>Ngày hẹn:</strong> {appointmentDate:dddd, dd/MM/yyyy}</li>
                                                <li><strong>Lý do:</strong> Tư vấn sau sự kiện y tế</li>
                                            </ul>

                                            <p>Quý Phụ huynh vui lòng chuẩn bị và lưu ý thời gian để đảm bảo học sinh nhận được sự chăm sóc kịp thời.</p>

                                            <hr style=""margin: 24px 0;"">

                                            <p style=""color: #718096;"">
                                                📧 Email: fptschoolhealthcare_swpproject@gmail.com<br>
                                                ☎️ Điện thoại: 0764023678<br>
                                                🏫 Trường Tiểu học FPT, Lô E2a-7, Đường D1, TP. Thủ Đức
                                            </p>

                                            <p style=""text-align: center; margin-top: 30px; color: #4a5568;"">
                                                Trân trọng,<br>Phòng Y Tế Trường
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </body>
                            </html>";
                        await _emailService.SendEmailAsync(email, subject, body);
                    }
                }
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
