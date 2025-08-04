namespace MedicalManagement.Models.DTOs
{
    public class HealthCheckupDTO
    {
        public int CheckupId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public string CheckupType { get; set; } 
        public DateTime Date { get; set; } 
        public string Result { get; set; }  
        public string Recommendations { get; set; } 
        public string NurseName { get; set; }
        // ➕ Thuộc tính mới
        public double? WeightKg { get; set; }
        public double? HeightCm { get; set; }
        public string? Vision { get; set; }
        public string? DentalHealth { get; set; }
        public int? CardiovascularRate { get; set; }
    }


}
