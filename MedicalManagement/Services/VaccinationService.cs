using MedicalManagement.Data;
using MedicalManagement.Exceptions;
using MedicalManagement.Helpers;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class VaccinationService : IVaccinationService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notification;
        private readonly EmailService _emailService;
        private readonly IAuthService _authService;
        public VaccinationService(AppDbContext context, INotificationService notification, IAuthService authService, EmailService emailService)
        {
            _context = context;
            _notification = notification;
            _emailService = emailService;
            _authService = authService;
        }

        public async Task<List<VaccinationReadDTO>> GetAllAsync(int? planId = null)
        {
            var query = _context.Vaccinations
                .Include(v => v.Student)
                .AsQueryable();

            if (planId != null)
                query = query.Where(v => v.PlanId == planId);

            return await query
                .Select(v => new VaccinationReadDTO
                {
                    VaccinationId = v.VaccinationId,
                    StudentName = v.Student.Name,
                    VaccineName = v.VaccineName ?? "", 
                    BatchNumber = v.BatchNumber ?? "",
                    Date = v.Date == DateTime.MinValue ? null : v.Date,
                    Reaction = v.Reaction ?? "",
                    NextDoseDue = v.NextDoseDue
                })
                .ToListAsync();
        }

        public async Task<List<VaccinationReadDTO>> GetByPlanIdAndNurseAsync(int planId, int nurseId)
        {
            return await _context.Vaccinations
                .Where(v => v.PlanId == planId && v.NurseId == nurseId)
                .Include(v => v.Student)
                .Select(v => new VaccinationReadDTO
                {
                    VaccinationId = v.VaccinationId,
                    StudentName = v.Student.Name,
                    VaccineName = v.VaccineName ?? "",
                    BatchNumber = v.BatchNumber ?? "",
                    Date = v.Date == DateTime.MinValue ? null : v.Date,
                    Reaction = v.Reaction ?? "",
                    NextDoseDue = v.NextDoseDue
                })
                .ToListAsync();
        }




        public async Task UpdateAsync(int id, VaccinationUpdateDTO dto, int nurseId)
        {
            var vac = await _context.Vaccinations.FindAsync(id);
            if (vac == null || vac.NurseId != nurseId)
                throw new NotFoundException("Không tìm thấy bản ghi hoặc bạn không có quyền.");

            vac.VaccineName = dto.VaccineName ?? vac.VaccineName;
            vac.BatchNumber = dto.BatchNumber ?? vac.BatchNumber;
            vac.Date = DateTime.Now; // Thời điểm thực tiêm
            vac.Reaction = dto.Reaction ?? vac.Reaction;
            vac.NextDoseDue = dto.NextDoseDue ?? vac.NextDoseDue;

            await _context.SaveChangesAsync();

            // Lấy thông tin học sinh
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.StudentId == vac.StudentId);

            if (student?.ParentId != null)
            {
                var studentName = student.Name ?? "Không rõ";
                var reaction = string.IsNullOrWhiteSpace(vac.Reaction) ? "Không có phản ứng" : vac.Reaction;

                // Gửi thông báo trong hệ thống
                await _notification.SendToParentAsync(
                    vac.StudentId,
                    "Kết quả tiêm chủng",
                    $"Học sinh {studentName} đã tiêm vắc xin {vac.VaccineName}. Phản ứng ghi nhận: {reaction}.",
                    "Vaccination"
                );

                // Lấy email phụ huynh và gửi email
                var parentAccount = await _context.UserAccounts
                    .FirstOrDefaultAsync(u => u.Role == "Parent" && u.ReferenceId == student.ParentId);

                if (parentAccount != null)
                {
                    var parentEmail = await _authService.GetEmailByUser(parentAccount);
                    if (!string.IsNullOrEmpty(parentEmail))
                    {
                        var subject = $"💉 Kết quả tiêm chủng - {studentName}";
                        var body = CreateVaccinationEmailBody(studentName, vac, reaction);
                        await _emailService.SendEmailAsync(parentEmail, subject, body);
                    }
                }
            }
        }

        private string CreateVaccinationEmailBody(string studentName, Vaccination vaccination, string reaction)
        {
            var hasReaction = !string.IsNullOrWhiteSpace(vaccination.Reaction);
            var headerColor = hasReaction ? "#f6ad55" : "#48bb78";
            var headerGradient = hasReaction ? "linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)" : "linear-gradient(135deg, #48bb78 0%, #38a169 100%)";
            var cardBackground = hasReaction ? "#fef5e7" : "#f0fff4";
            var cardBorder = hasReaction ? "#f6ad55" : "#68d391";
            var textColor = hasReaction ? "#744210" : "#22543d";
            var icon = hasReaction ? "⚠️" : "✅";

            return $@"
    <!DOCTYPE html>
    <html lang=""vi"">
    <head>
        <meta charset=""UTF-8"">
        <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
        <title>Kết quả tiêm chủng</title>
    </head>
    <body style=""margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;"">
        <table style=""width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;"">
            
            <!-- Header -->
            <tr>
                <td style=""background: {headerGradient}; padding: 30px 40px; text-align: center;"">
                    <h1 style=""color: white; margin: 0; font-size: 24px; font-weight: 600;"">
                        💉 Kết Quả Tiêm Chủng
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
                            Kính gửi Quý Phụ huynh của em <span style=""color: {headerColor};"">{studentName}</span>
                        </h2>
                        <p style=""color: #4a5568; line-height: 1.6; margin: 0; font-size: 16px;"">
                            Nhà trường trân trọng thông báo kết quả tiêm chủng của em.
                        </p>
                    </div>

                    <!-- Vaccination Results Card -->
                    <div style=""background-color: {cardBackground}; border: 2px solid {cardBorder}; border-radius: 12px; padding: 24px; margin-bottom: 30px;"">
                        <h3 style=""color: {textColor}; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;"">
                            💉 Thông tin tiêm chủng
                        </h3>
        
                        <table style=""width: 100%; border-collapse: collapse;"">
                            <tr>
                                <td style=""padding: 12px 0; border-bottom: 1px solid {cardBorder}; font-weight: 600; color: {textColor}; width: 35%;"">
                                    Tên vắc xin:
                                </td>
                                <td style=""padding: 12px 0; border-bottom: 1px solid {cardBorder}; color: #2d3748;"">
                                    {vaccination.VaccineName}
                                </td>
                            </tr>
                            <tr>
                                <td style=""padding: 12px 0; border-bottom: 1px solid {cardBorder}; font-weight: 600; color: {textColor};"">
                                    Số lô:
                                </td>
                                <td style=""padding: 12px 0; border-bottom: 1px solid {cardBorder}; color: #2d3748;"">
                                    {vaccination.BatchNumber}
                                </td>
                            </tr>
                            <tr>
                                <td style=""padding: 12px 0; border-bottom: 1px solid {cardBorder}; font-weight: 600; color: {textColor};"">
                                    Thời gian tiêm:
                                </td>
                                <td style=""padding: 12px 0; border-bottom: 1px solid {cardBorder}; color: #2d3748;"">
                                    {vaccination.Date:dd/MM/yyyy HH:mm}
                                </td>
                            </tr>
                            <tr>
                                <td style=""padding: 12px 0; border-bottom: 1px solid {cardBorder}; font-weight: 600; color: {textColor};"">
                                    Phản ứng:
                                </td>
                                <td style=""padding: 12px 0; border-bottom: 1px solid {cardBorder}; color: #2d3748;"">
                                    {icon} {reaction}
                                </td>
                            </tr>
                            {(vaccination.NextDoseDue.HasValue ? $@"
                            <tr>
                                <td style=""padding: 12px 0; font-weight: 600; color: {textColor};"">
                                    Mũi tiếp theo:
                                </td>
                                <td style=""padding: 12px 0; color: #2d3748;"">
                                    {vaccination.NextDoseDue.Value:dd/MM/yyyy}
                                </td>
                            </tr>" : "")}
                        </table>
                    </div>

                    <!-- Reaction Status -->
                    {(hasReaction ? $@"
                    <div style=""background-color: #fff5f5; border: 2px solid #f56565; border-radius: 8px; padding: 20px; margin-bottom: 30px;"">
                        <h4 style=""color: #c53030; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;"">
                            ⚠️ Lưu ý về phản ứng:
                        </h4>
                        <p style=""color: #742a2a; line-height: 1.6; margin: 0 0 12px 0;"">
                            Em có một số phản ứng sau tiêm chủng. Đây là hiện tượng bình thường nhưng cần theo dõi.
                        </p>
                        <ul style=""color: #742a2a; margin: 0; padding-left: 20px; line-height: 1.6;"">
                            <li>Theo dõi sát tình trạng của em trong 24-48 giờ tới</li>
                            <li>Nếu có triệu chứng bất thường, liên hệ ngay với y tá trường</li>
                            <li>Đảm bảo em nghỉ ngơi đủ và uống nhiều nước</li>
                        </ul>
                    </div>" : $@"
                    <div style=""background-color: #e6fffa; border: 2px solid #4fd1c7; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;"">
                        <h4 style=""color: #234e52; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;"">
                            🌟 Tuyệt vời!
                        </h4>
                        <p style=""color: #234e52; line-height: 1.6; margin: 0; font-size: 16px;"">
                            Em <strong>{studentName}</strong> đã tiêm chủng thành công và không có phản ứng nào. 
                            Hệ thống miễn dịch của em đang được bảo vệ tốt!
                        </p>
                    </div>")}

                    <!-- Post-Vaccination Care -->
                    <div style=""background-color: #f7fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;"">
                        <h4 style=""color: #2d3748; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;"">
                            🩹 Chăm sóc sau tiêm chủng:
                        </h4>
                        <ul style=""color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.6;"">
                            <li>Giữ vùng tiêm sạch sẽ và khô ráo</li>
                            <li>Cho em uống nhiều nước và nghỉ ngơi đầy đủ</li>
                            <li>Tránh cho em tắm nước quá nóng trong 24 giờ đầu</li>
                            <li>Theo dõi nhiệt độ cơ thể của em</li>
                            <li>Nếu có sốt nhẹ, có thể cho em uống thuốc hạ sốt theo hướng dẫn bác sĩ</li>
                        </ul>
                    </div>

                    <!-- Next Dose Reminder -->
                    {(vaccination.NextDoseDue.HasValue ? $@"
                    <div style=""background-color: #e6fffa; border: 2px solid #4fd1c7; border-radius: 12px; padding: 24px; margin-bottom: 30px;"">
                        <h3 style=""color: #234e52; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;"">
                            📅 Lịch tiêm mũi tiếp theo
                        </h3>
                        <p style=""color: #234e52; line-height: 1.6; margin: 0; font-size: 16px;"">
                            Mũi tiêm tiếp theo của em <strong>{studentName}</strong> được lên lịch vào:
                        </p>
                        <p style=""color: #2d3748; font-size: 18px; font-weight: 600; margin: 16px 0 0 0; text-align: center; background-color: #ffffff; padding: 12px; border-radius: 8px;"">
                            📅 {vaccination.NextDoseDue.Value:dd/MM/yyyy}
                        </p>
                        <p style=""color: #234e52; line-height: 1.6; margin: 16px 0 0 0; font-size: 14px; text-align: center;"">
                            Hệ thống sẽ gửi thông báo nhắc nhở trước ngày tiêm
                        </p>
                    </div>" : "")}

                    <!-- Emergency Contact -->
                    <div style=""background-color: #fff5f5; border: 2px solid #f56565; border-radius: 8px; padding: 20px; margin-bottom: 30px;"">
                        <h4 style=""color: #c53030; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;"">
                            🚨 Khi nào cần liên hệ ngay:
                        </h4>
                        <ul style=""color: #742a2a; margin: 0; padding-left: 20px; line-height: 1.6;"">
                            <li>Sốt cao trên 38.5°C kéo dài quá 2 ngày</li>
                            <li>Vùng tiêm sưng đỏ, nóng hoặc có mủ</li>
                            <li>Em có biểu hiện dị ứng (nổi mề đay, khó thở)</li>
                            <li>Em quấy khóc liên tục hoặc bất thường</li>
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
                            🏢 Địa chỉ: Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, TPHCM<br>
                            🚑 Khẩn cấp: 115 (Cấp cứu), 113 (Cảnh sát)
                        </p>
                    </div>

                    <!-- Footer Message -->
                    <div style=""text-align: center; margin-top: 30px;"">
                        <p style=""color: #4a5568; font-size: 16px; font-weight: 500; margin: 0;"">
                            Việc tiêm chủng giúp bảo vệ sức khỏe của em và cộng đồng! 💪
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


