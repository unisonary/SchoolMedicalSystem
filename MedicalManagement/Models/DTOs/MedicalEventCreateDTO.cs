namespace MedicalManagement.Models.DTOs
{
    public class MedicalEventCreateDTO
    {
        public int StudentId { get; set; }
        public string EventType { get; set; }
        public string Description { get; set; }
        public string Severity { get; set; }
        public string Location { get; set; }
        public string TreatmentGiven { get; set; }
        public bool ParentNotified { get; set; }
        public bool FollowUpRequired { get; set; }
    }
}
