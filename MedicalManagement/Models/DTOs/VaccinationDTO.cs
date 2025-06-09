namespace MedicalManagement.Models.DTOs
{
    public class VaccinationDTO
    {
        public int VaccinationId { get; set; }
        public string VaccineName { get; set; }
        public DateTime Date { get; set; }
        public string NurseName { get; set; }
        public string Reaction { get; set; }
        public DateTime? NextDoseDue { get; set; }
    }
}
