namespace MedicalManagement.Models.DTOs
{
    public class DeniedStudentDTO
    {
        public int ConsentId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentClass { get; set; } = string.Empty;
        public string ConsentStatus { get; set; } = string.Empty; // "Denied" hoặc "Email_Denied"
        public DateTime? ConsentDate { get; set; }
        public string? Notes { get; set; }
        public string ParentName { get; set; } = string.Empty;
        public bool IsEmailDenied => ConsentStatus == "Email_Denied";
    }
}