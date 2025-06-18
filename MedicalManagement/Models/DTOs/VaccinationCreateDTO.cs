namespace MedicalManagement.Models.DTOs
{
    public class VaccinationCreateDTO
    {
        public int StudentId { get; set; }
        public int PlanId { get; set; }
        public string VaccineName { get; set; }
        public string BatchNumber { get; set; }
        public DateTime Date { get; set; }
        public string Reaction { get; set; }
        public DateTime? NextDoseDue { get; set; }
    }
}
