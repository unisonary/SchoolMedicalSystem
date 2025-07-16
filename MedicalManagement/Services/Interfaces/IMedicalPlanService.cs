using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IMedicalPlanService
    {
        Task<int> CreateAsync(MedicalPlanCreateDTO dto, int managerId);
        Task<List<MedicalPlanReadDTO>> GetAllAsync();
        Task UpdateAsync(int id, MedicalPlanUpdateDTO dto);
        Task DeleteAsync(int id);

        Task<int?> GetPlanIdByNameAsync(string planName);
    }
}
