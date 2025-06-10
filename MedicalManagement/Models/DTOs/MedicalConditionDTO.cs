namespace MedicalManagement.Models.DTOs
{
    public class MedicalConditionDTO
    {
        public int ConditionId { get; set; }
        public string ConditionType { get; set; }
        public string ConditionName { get; set; }
        public string Severity { get; set; }
        public string Description { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; }

    }

}
