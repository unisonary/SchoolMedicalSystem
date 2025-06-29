namespace MedicalManagement.Models.DTOs
{
    public class VaccinationReportFilterDTO
    {
        public string? Grade { get; set; }
        public string? VaccineName { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
