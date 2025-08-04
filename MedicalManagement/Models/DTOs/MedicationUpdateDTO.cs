namespace MedicalManagement.Models.DTOs
{
    public class MedicationUpdateDTO
    {
        public string? MedicationName { get; set; }
        public string? Dosage { get; set; }
        public string? Frequency { get; set; }
        public string? Instructions { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        // THÊM DÒNG NÀY VÀO
        public string? PrescriptionImageUrl { get; set; }
    }
}