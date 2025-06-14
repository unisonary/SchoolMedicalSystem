namespace MedicalManagement.Models.DTOs
{
    public class MedicationReadDTO
    {
        public int MedicationId { get; set; }
        public int StudentId { get; set; }
        public string MedicationName { get; set; }
        public string Dosage { get; set; }
        public string Frequency { get; set; }
        public string Instructions { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; }
        public bool ProvidedByParent { get; set; }
    }
}
