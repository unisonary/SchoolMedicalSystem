using MedicalManagement.Data;
using MedicalManagement.Exceptions;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class ConsentService : IConsentService
    {
        private readonly AppDbContext _context;

        public ConsentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ConsentReadDTO>> GetPendingConsentsAsync(int parentId)
        {
            var consents = await _context.Consents
                .Where(c => c.ParentId == parentId && (c.ConsentStatus == "Pending" || c.ConsentStatus == "Email_Denied"))
                .Include(c => c.Student)
                .ToListAsync();

            return consents.Select(c => new ConsentReadDTO
            {
                ConsentId = c.ConsentId,
                ConsentType = c.ConsentType,
                ReferenceId = c.ReferenceId,
                ConsentStatus = c.ConsentStatus,
                ConsentDate = c.ConsentDate,
                Notes = c.Notes,
                StudentName = c.Student.Name // 👈 Now accessible
            }).ToList();
        }

        public async Task<List<ConsentReadDTO>> GetConsentHistoryAsync(int parentId)
        {
            var consents = await _context.Consents
                .Where(c => c.ParentId == parentId && (c.ConsentStatus == "Approved" || c.ConsentStatus == "Denied"))
                .Include(c => c.Student)
                .OrderByDescending(c => c.ConsentDate)
                .ToListAsync();

            return consents.Select(c => new ConsentReadDTO
            {
                ConsentId = c.ConsentId,
                ConsentType = c.ConsentType,
                ReferenceId = c.ReferenceId,
                ConsentStatus = c.ConsentStatus,
                ConsentDate = c.ConsentDate,
                Notes = c.Notes,
                StudentName = c.Student.Name
            }).ToList();
        }

        public async Task RespondToConsentAsync(int consentId, int parentId, ConsentActionDTO dto)
        {
            var consent = await _context.Consents.FindAsync(consentId);
            if (consent == null)
                throw new Exception("Không tìm thấy yêu cầu xác nhận.");

            if (consent.ParentId != parentId)
                throw new UnauthorizedAccessException();

            if (consent.ConsentStatus != "Pending" && consent.ConsentStatus != "Email_Denied")
                throw new InvalidOperationException("Yêu cầu này đã được phản hồi trước đó.");

            consent.ConsentStatus = dto.ConsentStatus;
            consent.ConsentDate = DateTime.Now;
            
            // Xử lý Notes: cho phép nhập lý do tùy chọn qua app
            if (string.IsNullOrWhiteSpace(dto.Notes))
            {
                // Nếu trước đó đã có notes từ email và phụ huynh không nhập gì mới, giữ nguyên
                if (string.IsNullOrWhiteSpace(consent.Notes))
                {
                    // Chỉ tạo ghi chú mặc định nếu chưa có ghi chú nào
                    var planTypeText = consent.ConsentType == "Health_Checkup"
                        ? "kế hoạch khám sức khỏe định kỳ"
                        : "kế hoạch tiêm chủng";
                        
                    consent.Notes = dto.ConsentStatus == "Approved"
                        ? $"Tôi đồng ý cho con tham gia vào {planTypeText}."
                        : $"Tôi không đồng ý cho con tham gia vào {planTypeText}.";
                }
                // Nếu đã có notes từ email, giữ nguyên
            }
            else
            {
                // Sử dụng ghi chú do phụ huynh nhập (qua app) - ghi đè lên notes cũ
                consent.Notes = dto.Notes.Trim();
            }

            await _context.SaveChangesAsync();
        }

        // Manager functions for consent management
        public async Task<List<ConsentReadDTO>> GetAllConsentsByPlanAsync(int planId)
        {
            var consents = await _context.Consents
                .Where(c => c.ReferenceId == planId)
                .Include(c => c.Student)
                .OrderByDescending(c => c.ConsentDate ?? c.RequestedDate)
                .ToListAsync();

            return consents.Select(c => new ConsentReadDTO
            {
                ConsentId = c.ConsentId,
                ConsentType = c.ConsentType,
                ReferenceId = c.ReferenceId,
                ConsentStatus = c.ConsentStatus,
                ConsentDate = c.ConsentDate,
                Notes = c.Notes,
                StudentName = c.Student.Name
            }).ToList();
        }

        public async Task<List<ConsentReadDTO>> GetDeniedConsentsAsync(int? planId = null)
        {
            var baseQuery = _context.Consents
                .Where(c => c.ConsentStatus == "Denied"); // Chỉ lấy Denied thực sự, không lấy Email_Denied

            if (planId.HasValue)
            {
                baseQuery = baseQuery.Where(c => c.ReferenceId == planId.Value);
            }

            var consents = await baseQuery
                .Include(c => c.Student)
                .OrderByDescending(c => c.ConsentDate ?? c.RequestedDate)
                .ToListAsync();

            return consents.Select(c => new ConsentReadDTO
            {
                ConsentId = c.ConsentId,
                ConsentType = c.ConsentType,
                ReferenceId = c.ReferenceId,
                ConsentStatus = c.ConsentStatus,
                ConsentDate = c.ConsentDate,
                Notes = c.Notes,
                StudentName = c.Student.Name
            }).ToList();
        }

        public async Task<List<ConsentReadDTO>> GetEmailDeniedConsentsAsync(int? planId = null)
        {
            var baseQuery = _context.Consents
                .Where(c => c.ConsentStatus == "Email_Denied"); // Chỉ lấy Email_Denied

            if (planId.HasValue)
            {
                baseQuery = baseQuery.Where(c => c.ReferenceId == planId.Value);
            }

            var consents = await baseQuery
                .Include(c => c.Student)
                .OrderByDescending(c => c.ConsentDate ?? c.RequestedDate)
                .ToListAsync();

            return consents.Select(c => new ConsentReadDTO
            {
                ConsentId = c.ConsentId,
                ConsentType = c.ConsentType,
                ReferenceId = c.ReferenceId,
                ConsentStatus = c.ConsentStatus,
                ConsentDate = c.ConsentDate,
                Notes = c.Notes,
                StudentName = c.Student.Name
            }).ToList();
        }

        public async Task<List<DeniedStudentDTO>> GetDeniedStudentsByPlanAsync(int planId)
        {
            var result = await (from consent in _context.Consents
                               join student in _context.Students on consent.StudentId equals student.StudentId
                               join parent in _context.Parents on student.ParentId equals parent.ParentId into parentGroup
                               from parent in parentGroup.DefaultIfEmpty()
                               where consent.ReferenceId == planId && 
                                     (consent.ConsentStatus == "Denied" || consent.ConsentStatus == "Email_Denied")
                               orderby consent.ConsentDate ?? consent.RequestedDate descending
                               select new DeniedStudentDTO
                               {
                                   ConsentId = consent.ConsentId,
                                   StudentId = consent.StudentId,
                                   StudentName = student.Name ?? "Không xác định",
                                   StudentClass = !string.IsNullOrEmpty(student.Class) ? student.Class : "Chưa phân lớp",
                                   ConsentStatus = consent.ConsentStatus,
                                   ConsentDate = consent.ConsentDate,
                                   Notes = consent.Notes,
                                   ParentName = parent != null ? parent.Name : "Không xác định"
                               }).ToListAsync();

            return result;
        }

        public async Task UpdateConsentNotesAsync(int consentId, string notes)
        {
            var consent = await _context.Consents.FindAsync(consentId);
            if (consent == null)
                throw new NotFoundException("Không tìm thấy consent.");

            if (consent.ConsentStatus != "Denied" && consent.ConsentStatus != "Email_Denied")
                throw new InvalidOperationException("Chỉ có thể cập nhật lý do cho consent đã từ chối.");

            consent.Notes = notes?.Trim();
            await _context.SaveChangesAsync();
        }
    }
}
