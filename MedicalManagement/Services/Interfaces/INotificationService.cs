using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface INotificationService
    {

        Task SendToParentAsync(int studentId, string title, string content, string type);
        Task<List<MedicalNotificationDTO>> GetManagerNotificationsAsync();
        Task<bool> MarkManagerNotificationAsReadAsync(int id);
        Task<int> MarkAllManagerNotificationsAsReadAsync();


    }
}
