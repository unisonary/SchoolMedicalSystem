namespace MedicalManagement.Models.DTOs
{
    public class HealthCheckupCreateDTO
    {
        public int StudentId { get; set; }
        public int PlanId { get; set; }
        public string CheckupType { get; set; }
        public string Result { get; set; }
        public string? AbnormalFindings { get; set; }
        public string? Recommendations { get; set; }
        public bool FollowUpRequired { get; set; }
    }
}
