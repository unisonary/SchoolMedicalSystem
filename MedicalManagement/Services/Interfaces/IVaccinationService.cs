using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IVaccinationService
    {
        Task<List<VaccinationReadDTO>> GetAllAsync(int? planId = null);
        Task UpdateAsync(int id, VaccinationUpdateDTO dto, int nurseId);
        Task<List<VaccinationReadDTO>> GetByPlanIdAndNurseAsync(int planId, int nurseId);
    }
}
