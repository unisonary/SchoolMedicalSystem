using MedicalManagement.Data;
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
                .Where(c => c.ParentId == parentId && c.ConsentStatus == "Pending")
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
                .Where(c => c.ParentId == parentId && c.ConsentStatus != "Pending")
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

            if (consent.ConsentStatus != "Pending")
                throw new InvalidOperationException("Yêu cầu này đã được phản hồi trước đó.");

            consent.ConsentStatus = dto.ConsentStatus;
            consent.ConsentDate = DateTime.Now;
            consent.Notes = dto.Notes;

            await _context.SaveChangesAsync();
        }

    }
}
