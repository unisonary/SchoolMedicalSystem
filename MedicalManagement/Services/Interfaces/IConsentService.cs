using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IConsentService
    {
        Task<List<ConsentReadDTO>> GetPendingConsentsAsync(int parentId);
        Task<List<ConsentReadDTO>> GetConsentHistoryAsync(int parentId);
        Task RespondToConsentAsync(int consentId, int parentId, ConsentActionDTO dto);
        
        // Manager functions
        Task<List<ConsentReadDTO>> GetAllConsentsByPlanAsync(int planId);
        Task<List<ConsentReadDTO>> GetDeniedConsentsAsync(int? planId = null);
        Task<List<ConsentReadDTO>> GetEmailDeniedConsentsAsync(int? planId = null);
        Task<List<DeniedStudentDTO>> GetDeniedStudentsByPlanAsync(int planId);
        Task UpdateConsentNotesAsync(int consentId, string notes);
    }
}
