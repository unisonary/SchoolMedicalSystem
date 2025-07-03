using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IAssignmentService
    {
        Task AssignNurseAsync(AssignmentDTO dto);
        Task<List<ConsentedStudentDTO>> GetConsentedStudentsAsync(int planId);
    }
}