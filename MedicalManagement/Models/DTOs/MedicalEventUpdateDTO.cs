namespace MedicalManagement.Models.DTOs
{
    public class MedicalEventUpdateDTO
    {
        public string EventType { get; set; }
        public string Description { get; set; }
        public string Severity { get; set; }
        public string TreatmentGiven { get; set; }
        public string Location { get; set; }

    }
}
