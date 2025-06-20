namespace MedicalManagement.Models.DTOs
{
    public class MedicalPlanReadDTO
    {
        public int PlanId { get; set; }
        public string PlanType { get; set; }
        public string PlanName { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string TargetGrade { get; set; }
        public string Status { get; set; }
        public DateTime CreatedDate { get; set; }
    }

}
