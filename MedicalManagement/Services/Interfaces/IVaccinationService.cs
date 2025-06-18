using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IVaccinationService
    {
        Task<List<VaccinationReadDTO>> GetAllAsync();
        Task<int> CreateAsync(VaccinationCreateDTO dto, int nurseId);
        Task UpdateAsync(int id, VaccinationUpdateDTO dto, int nurseId);
    }
}
