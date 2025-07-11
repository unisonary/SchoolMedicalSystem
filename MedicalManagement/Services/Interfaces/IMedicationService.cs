using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IMedicationService
    {
        // Cho Parent
        Task<IEnumerable<MedicationReadDTO>> GetForParentAsync(int parentRefId, IEnumerable<int> studentIds);
        Task UpdateByParentAsync(int parentRefId, int id, MedicationUpdateDTO dto);

        // Cho Nurse
        Task<List<MedicationNurseReadDTO>> GetFromParentByStatusAsync(string status = "Active");
        Task VerifyAsync(int medicationId, MedicationVerifyDTO dto, int nurseId);
        Task CreateByNurseAsync(MedicationCreateDTO dto, int nurseId);

    }
}
