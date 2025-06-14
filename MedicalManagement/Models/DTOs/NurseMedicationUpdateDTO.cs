namespace MedicalManagement.Models.DTOs
{
    public class NurseMedicationUpdateDTO
    {
        public string? Status { get; set; }  // 'Active', 'Completed', 'Discontinued'
        public int? NurseId { get; set; }    // Optional, nhưng thường nên lấy từ token thay vì client gửi
        public string? Notes { get; set; }   // Ghi chú về tình trạng sử dụng thuốc
    }
}
