namespace MedicalManagement.Models.DTOs
{
    public class MedicalNotificationDTO
    {
        public int NotificationId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public string Title { get; set; }
        public string Content { get; set; } 
        public string NotificationType { get; set; } 
        public DateTime Date { get; set; } 
        public bool IsRead { get; set; } 
    }


}

