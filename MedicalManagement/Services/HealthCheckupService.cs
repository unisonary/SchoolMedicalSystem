using MedicalManagement.Data;
using MedicalManagement.Exceptions;
using MedicalManagement.Helpers;
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


        private readonly EmailService _emailService;
        private readonly IAuthService _authService;

        public HealthCheckupService(AppDbContext context, INotificationService notification,
            IAuthService authService, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
            _authService = authService;
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

        public async Task<List<HealthCheckupReadDTO>> GetByPlanIdAndNurseAsync(int planId, int nurseId)
        {
            return await _context.HealthCheckups
                .Where(h => h.PlanId == planId && h.NurseId == nurseId)
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
                // Lấy email của phụ huynh
                var parentAccount = await _context.UserAccounts
                    .FirstOrDefaultAsync(u => u.Role == "Parent" && u.ReferenceId == student.ParentId);

                string parentEmail = null;
                if (parentAccount != null)
                {
                    parentEmail = await _authService.GetEmailByUser(parentAccount);
                }

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

                    // Gửi thông báo trong hệ thống
                    await _notification.SendToParentAsync(
                        checkup.StudentId,
                        "Cảnh báo sức khỏe",
                        $"Học sinh {student.Name} có kết quả khám: {checkup.Result}. Cần theo dõi thêm. Hệ thống đã lên lịch tư vấn vào ngày mai quý phụ huynh kiểm tra email để xem chi tiết.",
                        "Appointment"
                    );

                    // Gửi email cảnh báo sức khỏe
                    if (!string.IsNullOrEmpty(parentEmail))
                    {
                        var subject = $"🚨 Cảnh báo sức khỏe - {student.Name}";
                        var body = CreateHealthWarningEmailBody(student.Name, checkup, appointment.AppointmentDate);
                        await _emailService.SendEmailAsync(parentEmail, subject, body);
                    }
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

                    // Gửi email thông báo kết quả bình thường
                    if (!string.IsNullOrEmpty(parentEmail))
                    {
                        var subject = $"✅ Kết quả khám sức khỏe - {student.Name}";
                        var body = CreateHealthResultEmailBody(student.Name, checkup);
                        await _emailService.SendEmailAsync(parentEmail, subject, body);
                    }
                }

                await _context.SaveChangesAsync();
            }
        }

        private string CreateHealthWarningEmailBody(string studentName, HealthCheckup checkup, DateTime appointmentDate)
        {
            return $@"
    <!DOCTYPE html>
    <html lang=""vi"">
    <head>
        <meta charset=""UTF-8"">
        <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
        <title>Cảnh báo sức khỏe</title>
    </head>
    <body style=""margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;"">
        <table style=""width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;"">
            
            <!-- Header -->
            <tr>
                <td style=""background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); padding: 30px 40px; text-align: center;"">
                    <h1 style=""color: white; margin: 0; font-size: 24px; font-weight: 600;"">
                        🚨 Cảnh Báo Sức Khỏe
                    </h1>
                    <p style=""color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;"">
                        Trường Tiểu Học FPT
                    </p>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td style=""padding: 40px;"">
                    
                    <!-- Greeting -->
                    <div style=""margin-bottom: 30px;"">
                        <h2 style=""color: #2d3748; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;"">
                            Kính gửi Quý Phụ huynh của em <span style=""color: #e53e3e;"">{studentName}</span>
                        </h2>
                        <p style=""color: #4a5568; line-height: 1.6; margin: 0; font-size: 16px;"">
                            Nhà trường trân trọng thông báo kết quả khám sức khỏe của em và cần sự chú ý từ Quý Phụ huynh.
                        </p>
                    </div>

                    <!-- Health Results Card -->
                    <div style=""background-color: #fed7d7; border: 2px solid #f56565; border-radius: 12px; padding: 24px; margin-bottom: 30px;"">
                        <h3 style=""color: #c53030; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;"">
                            🩺 Kết quả khám sức khỏe
                        </h3>
        
                        <table style=""width: 100%; border-collapse: collapse;"">
                            <tr>
                                <td style=""padding: 12px 0; border-bottom: 1px solid #feb2b2; font-weight: 600; color: #742a2a; width: 35%;"">
                                    Loại khám:
                                </td>
                                <td style=""padding: 12px 0; border-bottom: 1px solid #feb2b2; color: #2d3748;"">
                                    {checkup.CheckupType}
                                </td>
                            </tr>
                            <tr>
                                <td style=""padding: 12px 0; border-bottom: 1px solid #feb2b2; font-weight: 600; color: #742a2a;"">
                                    Kết quả:
                                </td>
                                <td style=""padding: 12px 0; border-bottom: 1px solid #feb2b2; color: #2d3748;"">
                                    {checkup.Result}
                                </td>
                            </tr>
                            <tr>
                                <td style=""padding: 12px 0; border-bottom: 1px solid #feb2b2; font-weight: 600; color: #742a2a;"">
                                    Ngày khám:
                                </td>
                                <td style=""padding: 12px 0; border-bottom: 1px solid #feb2b2; color: #2d3748;"">
                                    {checkup.Date:dd/MM/yyyy HH:mm}
                                </td>
                            </tr>
                            {(!string.IsNullOrEmpty(checkup.AbnormalFindings) ? $@"
                            <tr>
                                <td style=""padding: 12px 0; font-weight: 600; color: #742a2a;"">
                                    Phát hiện bất thường:
                                </td>
                                <td style=""padding: 12px 0; color: #2d3748;"">
                                    {checkup.AbnormalFindings}
                                </td>
                            </tr>" : "")}
                        </table>
                    </div>

                    <!-- Recommendations -->
                    {(!string.IsNullOrEmpty(checkup.Recommendations) ? $@"
                    <div style=""background-color: #fef5e7; border-left: 4px solid #f6ad55; padding: 20px; margin-bottom: 30px; border-radius: 8px;"">
                        <h4 style=""color: #744210; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;"">
                            💡 Khuyến nghị:
                        </h4>
                        <p style=""color: #744210; line-height: 1.6; margin: 0;"">
                            {checkup.Recommendations}
                        </p>
                    </div>" : "")}

                    <!-- Appointment Info -->
                    <div style=""background-color: #e6fffa; border: 2px solid #4fd1c7; border-radius: 12px; padding: 24px; margin-bottom: 30px;"">
                        <h3 style=""color: #234e52; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;"">
                            📅 Lịch hẹn tư vấn
                        </h3>
                        <p style=""color: #234e52; line-height: 1.6; margin: 0; font-size: 16px;"">
                            Hệ thống đã tự động lên lịch buổi tư vấn cho em <strong>{studentName}</strong> vào:
                        </p>
                        <p style=""color: #2d3748; font-size: 18px; font-weight: 600; margin: 16px 0 0 0; text-align: center; background-color: #ffffff; padding: 12px; border-radius: 8px;"">
                            📅 {appointmentDate:dd/MM/yyyy}
                        </p>
                    </div>

                    <!-- Important Actions -->
                    <div style=""background-color: #fff5f5; border: 2px solid #f56565; border-radius: 8px; padding: 20px; margin-bottom: 30px;"">
                        <h4 style=""color: #c53030; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;"">
                            ⚠️ Hành động cần thiết:
                        </h4>
                        <ul style=""color: #742a2a; margin: 0; padding-left: 20px; line-height: 1.6;"">
                            <li>Vui lòng chuẩn bị có mặt đúng giờ hẹn</li>
                            <li>Mang theo sổ sức khỏe của em (nếu có)</li>
                            <li>Chuẩn bị danh sách các câu hỏi muốn tư vấn</li>
                            <li>Nếu cần thay đổi lịch hẹn, vui lòng liên hệ sớm</li>
                        </ul>
                    </div>

                    <!-- Contact Info -->
                    <div style=""background-color: #f7fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;"">
                        <h4 style=""color: #2d3748; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;"">
                            📞 Thông tin liên hệ:
                        </h4>
                        <p style=""color: #4a5568; margin: 0; line-height: 1.6;"">
                            📧 Email: fptschoolhealthcare_swpproject@gmail.com<br>
                            📱 Điện thoại: (079) 1234 5678<br>
                            🏢 Địa chỉ: Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, TPHCM
                        </p>
                    </div>

                    <!-- Footer Message -->
                    <div style=""text-align: center; margin-top: 30px;"">
                        <p style=""color: #4a5568; font-size: 16px; font-weight: 500; margin: 0;"">
                            Sức khỏe của em là ưu tiên hàng đầu! 💚
                        </p>
                        <p style=""color: #718096; font-size: 14px; margin: 8px 0 0 0;"">
                            Y tá trường - Trường Tiểu Học FPT
                        </p>
                    </div>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style=""background-color: #2d3748; padding: 20px; text-align: center;"">
                    <p style=""color: #a0aec0; font-size: 12px; margin: 0;"">
                        Email này được gửi tự động từ hệ thống quản lý nhà trường.<br>
                        Vui lòng không trả lời trực tiếp email này.
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>";
        }

        private string CreateHealthResultEmailBody(string studentName, HealthCheckup checkup)
        {
            return $@"
    <!DOCTYPE html>
    <html lang=""vi"">
    <head>
        <meta charset=""UTF-8"">
        <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
        <title>Kết quả khám sức khỏe</title>
    </head>
    <body style=""margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;"">
        <table style=""width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;"">
            
            <!-- Header -->
            <tr>
                <td style=""background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px 40px; text-align: center;"">
                    <h1 style=""color: white; margin: 0; font-size: 24px; font-weight: 600;"">
                        ✅ Kết Quả Khám Sức Khỏe
                    </h1>
                    <p style=""color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;"">
                        Trường Tiểu Học FPT
                    </p>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td style=""padding: 40px;"">
                    
                    <!-- Greeting -->
                    <div style=""margin-bottom: 30px;"">
                        <h2 style=""color: #2d3748; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;"">
                            Kính gửi Quý Phụ huynh của em <span style=""color: #48bb78;"">{studentName}</span>
                        </h2>
                        <p style=""color: #4a5568; line-height: 1.6; margin: 0; font-size: 16px;"">
                            Nhà trường trân trọng thông báo kết quả khám sức khỏe của em.
                        </p>
                    </div>

                    <!-- Health Results Card -->
                    <div style=""background-color: #f0fff4; border: 2px solid #68d391; border-radius: 12px; padding: 24px; margin-bottom: 30px;"">
                        <h3 style=""color: #22543d; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;"">
                            🩺 Kết quả khám sức khỏe
                        </h3>
        
                        <table style=""width: 100%; border-collapse: collapse;"">
                            <tr>
                                <td style=""padding: 12px 0; border-bottom: 1px solid #c6f6d5; font-weight: 600; color: #22543d; width: 35%;"">
                                    Loại khám:
                                </td>
                                <td style=""padding: 12px 0; border-bottom: 1px solid #c6f6d5; color: #2d3748;"">
                                    {checkup.CheckupType}
                                </td>
                            </tr>
                            <tr>
                                <td style=""padding: 12px 0; border-bottom: 1px solid #c6f6d5; font-weight: 600; color: #22543d;"">
                                    Kết quả:
                                </td>
                                <td style=""padding: 12px 0; border-bottom: 1px solid #c6f6d5; color: #2d3748;"">
                                    {checkup.Result}
                                </td>
                            </tr>
                            <tr>
                                <td style=""padding: 12px 0; font-weight: 600; color: #22543d;"">
                                    Ngày khám:
                                </td>
                                <td style=""padding: 12px 0; color: #2d3748;"">
                                    {checkup.Date:dd/MM/yyyy HH:mm}
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Recommendations -->
                    {(!string.IsNullOrEmpty(checkup.Recommendations) ? $@"
                    <div style=""background-color: #fef5e7; border-left: 4px solid #f6ad55; padding: 20px; margin-bottom: 30px; border-radius: 8px;"">
                        <h4 style=""color: #744210; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;"">
                            💡 Khuyến nghị:
                        </h4>
                        <p style=""color: #744210; line-height: 1.6; margin: 0;"">
                            {checkup.Recommendations}
                        </p>
                    </div>" : "")}

                    <!-- Good Health Message -->
                    <div style=""background-color: #e6fffa; border: 2px solid #4fd1c7; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;"">
                        <h4 style=""color: #234e52; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;"">
                            🌟 Chúc mừng!
                        </h4>
                        <p style=""color: #234e52; line-height: 1.6; margin: 0; font-size: 16px;"">
                            Em <strong>{studentName}</strong> có sức khỏe tốt. Hãy tiếp tục duy trì lối sống lành mạnh!
                        </p>
                    </div>

                    <!-- Health Tips -->
                    <div style=""background-color: #f7fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;"">
                        <h4 style=""color: #2d3748; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;"">
                            💪 Lời khuyên duy trì sức khỏe:
                        </h4>
                        <ul style=""color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.6;"">
                            <li>Ăn uống đầy đủ dinh dưỡng, nhiều rau xanh và trái cây</li>
                            <li>Tập thể dục thường xuyên và vận động mỗi ngày</li>
                            <li>Ngủ đủ giấc từ 8-10 tiếng mỗi đêm</li>
                            <li>Uống đủ nước và hạn chế đồ uống có đường</li>
                            <li>Giữ vệ sinh cá nhân và môi trường sạch sẽ</li>
                        </ul>
                    </div>

                    <!-- Contact Info -->
                    <div style=""background-color: #f7fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;"">
                        <h4 style=""color: #2d3748; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;"">
                            📞 Thông tin liên hệ:
                        </h4>
                        <p style=""color: #4a5568; margin: 0; line-height: 1.6;"">
                            📧 Email: fptschoolhealthcare_swpproject@gmail.com<br>
                            📱 Điện thoại: (079) 1234 5678<br>
                            🏢 Địa chỉ: Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, TPHCM
                        </p>
                    </div>

                    <!-- Footer Message -->
                    <div style=""text-align: center; margin-top: 30px;"">
                        <p style=""color: #4a5568; font-size: 16px; font-weight: 500; margin: 0;"">
                            Chúc em luôn khỏe mạnh và học tập tốt! 💚
                        </p>
                        <p style=""color: #718096; font-size: 14px; margin: 8px 0 0 0;"">
                            Y tá trường - Trường Tiểu Học FPT
                        </p>
                    </div>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style=""background-color: #2d3748; padding: 20px; text-align: center;"">
                    <p style=""color: #a0aec0; font-size: 12px; margin: 0;"">
                        Email này được gửi tự động từ hệ thống quản lý nhà trường.<br>
                        Vui lòng không trả lời trực tiếp email này.
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>";
        }

    }

}
