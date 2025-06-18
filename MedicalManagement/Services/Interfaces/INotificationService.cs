namespace MedicalManagement.Services.Interfaces
{
    public interface INotificationService
    {
        Task SendToParentAsync(int studentId, string title, string content, string type);
    }
}
