namespace MedicalManagement.Models.DTOs
{
    public class ConsentActionDTO
    {
        public string ConsentStatus { get; set; }  // "Approved", "Denied"
        public string? Notes { get; set; }
    }
}
