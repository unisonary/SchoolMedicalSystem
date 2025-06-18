namespace MedicalManagement.Models.DTOs
{
    public class MedicationNurseReadDTO
    {
        public int MedicationId { get; set; }
        public string StudentName { get; set; }
        public string MedicationName { get; set; }
        public string Dosage { get; set; }
        public string Frequency { get; set; }
        public string Instructions { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; }
        public string? Note { get; set; }
    }

}
