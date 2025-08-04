namespace MedicalManagement.Models.DTOs
{
    public class MedicationReadDTO
    {
        public int MedicationId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } // Thêm tên học sinh
        public string ClassName { get; set; } 
        public string MedicationName { get; set; }
        public string Dosage { get; set; }
        public string Frequency { get; set; }
        public string Instructions { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; }
        public bool ProvidedByParent { get; set; }
        public string? PrescriptionImageUrl { get; set; } // Thêm URL ảnh toa thuốc
        public string? RejectionReason { get; set; } // Thêm lý do từ chối
    }
}
