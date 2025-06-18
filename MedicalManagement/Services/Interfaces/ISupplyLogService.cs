using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface ISupplyLogService
    {
        Task CreateAsync(SupplyLogCreateDTO dto, int nurseId);

        Task<List<SupplyLogReadDTO>> GetAllAsync();
    }

}
