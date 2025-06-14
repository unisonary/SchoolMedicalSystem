namespace MedicalManagement.Models.DTOs
{
    public class MedicalEventDTO
    {
        public int EventId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public string EventType { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; } 
        public string Severity { get; set; } 
        public string NurseName { get; set; } 
    }



}
