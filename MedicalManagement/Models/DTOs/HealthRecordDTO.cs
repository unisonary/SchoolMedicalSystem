namespace MedicalManagement.Models.DTOs
{

    public class HealthRecordDTO
    {
        public int RecordId { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public string NurseName { get; set; }
        public string Severity { get; set; }
    }
}
