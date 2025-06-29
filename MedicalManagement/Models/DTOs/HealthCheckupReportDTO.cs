namespace MedicalManagement.Models.DTOs
{
    public class HealthCheckupReportDTO
    {
        public string CheckupType { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public int TotalCheckups { get; set; }
        public int AbnormalCount { get; set; }
    }

}
