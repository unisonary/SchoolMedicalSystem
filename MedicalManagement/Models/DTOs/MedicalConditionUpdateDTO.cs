namespace MedicalManagement.Models.DTOs
{
    public class MedicalConditionUpdateDTO
    {
        public string ConditionType { get; set; }
        public string ConditionName { get; set; }
        public string Severity { get; set; }
        public string Description { get; set; }
    }
}
