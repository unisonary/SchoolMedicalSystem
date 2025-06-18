using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IHealthCheckupService
    {
        Task<List<HealthCheckupReadDTO>> GetAllAsync();
        Task<int> CreateAsync(HealthCheckupCreateDTO dto, int nurseId);
        Task UpdateAsync(int id, HealthCheckupUpdateDTO dto, int nurseId);
    }

}
