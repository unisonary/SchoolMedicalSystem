using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IInventoryService
    {
        Task<List<InventoryReadDTO>> GetAllAsync();
        Task<int> CreateAsync(InventoryCreateDTO dto);
        Task UpdateAsync(int id, InventoryUpdateDTO dto);

        Task SoftDeleteAsync(int id);
    }
}
