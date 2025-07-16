using MedicalManagement.Data;
using MedicalManagement.Exceptions;
using MedicalManagement.Helpers;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class MedicalPlanService : IMedicalPlanService
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        private readonly IAuthService _authService;
        private readonly EmailJwtHelper _emailJwtHelper;

        public MedicalPlanService(
            AppDbContext context,
            EmailService emailService,
            IAuthService authService,
            EmailJwtHelper emailJwtHelper)
        {
            _context = context;
            _emailService = emailService;
            _authService = authService;
            _emailJwtHelper = emailJwtHelper;
        }



        public async Task<int> CreateAsync(MedicalPlanCreateDTO dto, int managerId)
        {
            var managerAccount = await _context.UserAccounts
                                    .FirstOrDefaultAsync(u => u.Role == "Manager" && u.ReferenceId == managerId);

            if (managerAccount == null)
                throw new Exception("Không tìm thấy tài khoản của Manager.");

            int senderUserId = managerAccount.UserId;

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

            // Gửi consent và email xác nhận đến phụ huynh
            var students = await _context.Students
                .Where(s => s.Class == dto.TargetGrade && s.ParentId != null)
                .ToListAsync();


            foreach (var student in students)
            {
                var consent = new Consent
                {
                    StudentId = student.StudentId,
                    ParentId = student.ParentId,
                    ConsentType = dto.PlanType,
                    ReferenceId = plan.PlanId,
                    ConsentStatus = "Pending",
                    RequestedDate = DateTime.Now
                };
                _context.Consents.Add(consent);
                await _context.SaveChangesAsync();

                var parentAccount = await _context.UserAccounts
                    .FirstOrDefaultAsync(u => u.Role == "Parent" && u.ReferenceId == student.ParentId);

                if (parentAccount != null)
                {
                    var email = await _authService.GetEmailByUser(parentAccount);
                    if (!string.IsNullOrEmpty(email))
                    {
                        var tokenApproved = _emailJwtHelper.GenerateToken(consent.ConsentId, "Approved", 4320);
                        var tokenDenied = _emailJwtHelper.GenerateToken(consent.ConsentId, "Denied", 4320);
                        var approveLink = $"http://localhost:7170/api/public/consents/respond?token={tokenApproved}";
                        var denyLink = $"http://localhost:7170/api/public/consents/respond?token={tokenDenied}";

                        var subject = $"🏥 Xác nhận tham gia kế hoạch y tế - {student.Name}";

                        var body = $@"
                        <!DOCTYPE html>
                        <html lang=""vi"">
                        <head>
                            <meta charset=""UTF-8"">
                            <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                            <title>Xác nhận kế hoạch y tế</title>
                        </head>
                        <body style=""margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;"">
                            <table style=""width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;"">
        
                                <!-- Header -->
                                <tr>
                                    <td style=""background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 40px; text-align: center;"">
                                        <h1 style=""color: white; margin: 0; font-size: 24px; font-weight: 600;"">
                                            🏥 Thông Báo Kế Hoạch Y Tế
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
                                                Kính gửi Quý Phụ huynh của em <span style=""color: #667eea;"">{student.Name}</span>
                                            </h2>
                                            <p style=""color: #4a5568; line-height: 1.6; margin: 0; font-size: 16px;"">
                                                Nhà trường trân trọng thông báo về kế hoạch y tế sắp tới và cần sự đồng ý của Quý Phụ huynh.
                                            </p>
                                        </div>

                                        <!-- Plan Details Card -->
                                        <div style=""background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 30px;"">
                                            <h3 style=""color: #2d3748; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;"">
                                                📋 Thông tin kế hoạch y tế
                                            </h3>
                    
                                            <table style=""width: 100%; border-collapse: collapse;"">
                                                <tr>
                                                    <td style=""padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #4a5568; width: 30%;"">
                                                        Tên kế hoạch:
                                                    </td>
                                                    <td style=""padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;"">
                                                        {dto.PlanName}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style=""padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #4a5568;"">
                                                        Loại hoạt động:
                                                    </td>
                                                    <td style=""padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;"">
                                                        {dto.PlanType}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style=""padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #4a5568;"">
                                                        Thời gian:
                                                    </td>
                                                    <td style=""padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2d3748;"">
                                                        {dto.StartDate:dd/MM/yyyy} - {dto.EndDate:dd/MM/yyyy}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style=""padding: 12px 0; font-weight: 600; color: #4a5568;"">
                                                        Khối lớp:
                                                    </td>
                                                    <td style=""padding: 12px 0; color: #2d3748;"">
                                                        {dto.TargetGrade}
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>

                                        <!-- Description -->
                                        {(string.IsNullOrEmpty(dto.Description) ? "" : $@"
                                        <div style=""background-color: #fef5e7; border-left: 4px solid #f6ad55; padding: 20px; margin-bottom: 30px; border-radius: 8px;"">
                                            <h4 style=""color: #744210; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;"">
                                                📝 Mô tả chi tiết:
                                            </h4>
                                            <p style=""color: #744210; line-height: 1.6; margin: 0;"">
                                                {dto.Description}
                                            </p>
                                        </div>")}

                                        <!-- Action Buttons -->
                                        <div style=""text-align: center; margin-bottom: 30px;"">
                                            <h3 style=""color: #2d3748; margin: 0 0 24px 0; font-size: 18px; font-weight: 600;"">
                                                Vui lòng chọn một trong hai lựa chọn bên dưới:
                                            </h3>
                    
                                            <div style=""display: inline-block; margin: 0 10px;"">
                                                <a href=""{approveLink}"" style=""display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3); transition: all 0.3s ease;"">
                                                    ✅ Tôi đồng ý cho con tham gia
                                                </a>
                                            </div>
                    
                                            <div style=""display: inline-block; margin: 0 10px;"">
                                                <a href=""{denyLink}"" style=""display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3); transition: all 0.3s ease;"">
                                                    ❌ Tôi không đồng ý cho con tham gia
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Important Note -->
                                        <div style=""background-color: #e6fffa; border: 2px solid #4fd1c7; border-radius: 8px; padding: 20px; margin-bottom: 30px;"">
                                            <h4 style=""color: #234e52; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;"">
                                                ⚠️ Lưu ý quan trọng:
                                            </h4>
                                            <ul style=""color: #234e52; margin: 0; padding-left: 20px; line-height: 1.6;"">
                                                <li>Vui lòng phản hồi trước ngày {dto.StartDate.AddDays(-1):dd/MM/yyyy}</li>
                                                <li>Mỗi link chỉ sử dụng được một lần duy nhất</li>
                                                <li>Nếu có thắc mắc, vui lòng liên hệ văn phòng nhà trường</li>
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
                                                Trân trọng cảm ơn sự hợp tác của Quý Phụ huynh! 🙏
                                            </p>
                                            <p style=""color: #718096; font-size: 14px; margin: 8px 0 0 0;"">
                                                Ban Giám Hiệu - Trường Tiểu Học FPT
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

                        await _emailService.SendEmailAsync(email, subject, body);

                        _context.MedicalNotifications.Add(new MedicalNotification
                        {
                            SenderId = senderUserId,
                            RecipientType = "Parent",
                            StudentId = student.StudentId,
                            Title = $"Yêu cầu xác nhận kế hoạch y tế",
                            Content = $"Kế hoạch \"{dto.PlanName}\" ({dto.PlanType}) sẽ diễn ra từ {dto.StartDate:dd/MM/yyyy} đến {dto.EndDate:dd/MM/yyyy}. Vui lòng phản hồi xác nhận.",
                            NotificationType = "Consent_Request",
                            Date = DateTime.Now,
                            IsRead = false,
                            Priority = "High"
                        });

                        await _context.SaveChangesAsync();
                    }
                }
            }
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
        
        public async Task<int?> GetPlanIdByNameAsync(string planName)
        {
            return await _context.MedicalPlans
                .Where(p => p.PlanType == "Health_Checkup" && p.PlanName == planName)
                .Select(p => (int?)p.PlanId)
                .FirstOrDefaultAsync();
        }

    }
}
