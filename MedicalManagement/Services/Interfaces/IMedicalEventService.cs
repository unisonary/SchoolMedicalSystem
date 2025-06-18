using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IMedicalEventService
    {
        Task<List<MedicalEventDTO>> GetAllAsync();
        Task<MedicalEventDTO> GetByIdAsync(int id);
        Task<int> CreateAsync(MedicalEventCreateDTO dto, int nurseId);
        Task UpdateAsync(int id, MedicalEventUpdateDTO dto);
        Task SoftDeleteAsync(int id);
    }
}
