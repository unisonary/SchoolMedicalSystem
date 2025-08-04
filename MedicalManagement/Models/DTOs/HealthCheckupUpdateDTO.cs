namespace MedicalManagement.Models.DTOs
{
    public class HealthCheckupUpdateDTO
    {
        public string? CheckupType { get; set; }
        public string? Result { get; set; }
        public string? AbnormalFindings { get; set; }
        public string? Recommendations { get; set; }
        public bool? FollowUpRequired { get; set; }
        // ➕ Thuộc tính mới
        public double? WeightKg { get; set; }
        public double? HeightCm { get; set; }
        public string? Vision { get; set; }
        public string? DentalHealth { get; set; }
        public int? CardiovascularRate { get; set; }
    }
}
