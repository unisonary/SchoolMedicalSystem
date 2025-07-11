using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IParentStudentService
    {
        Task<List<MedicalEventDTO>> GetMedicalEventsAsync(string username);
        Task<List<HealthCheckupDTO>> GetHealthCheckupsAsync(string username);
        Task<List<MedicalNotificationDTO>> GetMedicalNotificationsAsync(string username);
        Task<bool> MarkNotificationAsReadAsync(string username, int notificationId);
        Task<int> MarkAllNotificationsAsReadAsync(string username);

    }

}
