namespace MedicalManagement.Models.DTOs
{
    public class MedicalPlanUpdateDTO : MedicalPlanCreateDTO
    {
        public string Status { get; set; } // "Planned", "In Progress", "Completed"
    }
}
