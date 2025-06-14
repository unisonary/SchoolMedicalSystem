namespace MedicalManagement.Models.DTOs
{
    public class AppointmentCreateDTO
    {
        public int StudentId { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string Reason { get; set; }
    }
}
