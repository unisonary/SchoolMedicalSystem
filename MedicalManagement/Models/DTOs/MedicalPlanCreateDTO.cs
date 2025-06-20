namespace MedicalManagement.Models.DTOs
{
    public class MedicalPlanCreateDTO
    {
        public string PlanType { get; set; } // "Vaccination" or "Health_Checkup"
        public string PlanName { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string TargetGrade { get; set; }
    }
}
