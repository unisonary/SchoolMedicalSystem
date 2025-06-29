namespace MedicalManagement.Models.DTOs
{
    public class VaccinationReportDTO
    {
        public string VaccineName { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public int StudentCount { get; set; }
    }

}
