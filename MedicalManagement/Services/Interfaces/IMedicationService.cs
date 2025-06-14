using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IMedicationService
    {
        // Cho Parent
        Task<IEnumerable<MedicationReadDTO>> GetForParentAsync(int parentRefId, IEnumerable<int> studentIds);
        Task UpdateByParentAsync(int parentRefId, int id, MedicationUpdateDTO dto);

        // Cho Nurse
        Task<IEnumerable<MedicationReadDTO>> GetForNurseAsync();
        Task UpdateByNurseAsync(int nurseRefId, int id, NurseMedicationUpdateDTO dto);
    }
}
