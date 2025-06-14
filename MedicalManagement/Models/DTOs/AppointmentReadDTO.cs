namespace MedicalManagement.Models.DTOs
{
    public class AppointmentReadDTO
    {
        public int AppointmentId { get; set; }
        public string StudentName { get; set; }
        public string NurseName { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
    }
}
