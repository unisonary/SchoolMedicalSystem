namespace MedicalManagement.Models.DTOs
{
    public class AssignmentDTO
    {
        public int PlanId { get; set; }
        public int NurseId { get; set; }
        public List<int> StudentIds { get; set; } = new();
    }
}
