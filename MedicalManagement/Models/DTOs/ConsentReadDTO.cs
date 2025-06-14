namespace MedicalManagement.Models.DTOs
{
    public class ConsentReadDTO
    {
        public int ConsentId { get; set; }
        public string ConsentType { get; set; }
        public int ReferenceId { get; set; }
        public string ConsentStatus { get; set; }
        public DateTime? ConsentDate { get; set; }
        public string? Notes { get; set; }
    }
}
