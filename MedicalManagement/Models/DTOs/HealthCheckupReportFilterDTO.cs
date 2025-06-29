namespace MedicalManagement.Models.DTOs
{
    public class HealthCheckupReportFilterDTO
    {
        public string? Grade { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }   
}
