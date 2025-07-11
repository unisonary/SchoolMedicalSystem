using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IHealthCheckupService
    {
        Task<List<HealthCheckupReadDTO>> GetByPlanIdAsync(int planId);
        Task UpdateAsync(int id, HealthCheckupUpdateDTO dto, int nurseId);

        Task<List<HealthCheckupReadDTO>> GetByPlanIdAndNurseAsync(int planId, int nurseId);
    }

}
