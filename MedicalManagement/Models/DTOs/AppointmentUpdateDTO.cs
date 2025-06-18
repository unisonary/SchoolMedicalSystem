namespace MedicalManagement.Models.DTOs
{
    public class AppointmentUpdateDTO
    {
        public string? Status { get; set; } // "Pending" / "Completed"
        public string? Notes { get; set; }
        public DateTime? AppointmentDate { get; set; }
    }

}
