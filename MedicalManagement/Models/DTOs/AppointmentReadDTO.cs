namespace MedicalManagement.Models.DTOs
{
    public class AppointmentReadDTO
    {
        public int AppointmentId { get; set; }
        public string StudentName { get; set; }
        public string ParentName { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
        public string? Notes { get; set; }
    }

}
