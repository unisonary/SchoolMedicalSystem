using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IInventoryAlertService
    {
        Task<List<InventoryItemAlertDTO>> GetAlertsAsync(string? alertType); // alertType = null | "LowStock" | "ExpirySoon"
        Task GenerateDailyInventoryAlertsAsync(); // Dùng cho Hangfire để gửi cảnh báo tự động
    }


}
