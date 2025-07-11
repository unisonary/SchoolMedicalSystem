namespace MedicalManagement.Models.DTOs
{
    public class ParticipationReportDTO
    {
        public int PlanId { get; set; }
        public string PlanName { get; set; } = "";
        public string PlanType { get; set; } = ""; // Vaccination / Health_Checkup
        public string TargetGrade { get; set; } = "";
        public int TotalStudents { get; set; }
        public int ApprovedCount { get; set; }
        public int DeniedCount { get; set; }
        public double ParticipationRate => TotalStudents == 0 ? 0 : Math.Round(ApprovedCount * 100.0 / TotalStudents, 2);
    }
}
