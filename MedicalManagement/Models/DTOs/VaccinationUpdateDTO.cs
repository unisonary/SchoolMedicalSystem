namespace MedicalManagement.Models.DTOs
{
    public class VaccinationUpdateDTO
    {
        public string? VaccineName { get; set; }     
        public string? BatchNumber { get; set; }     
        public string? Reaction { get; set; }
        public DateTime? NextDoseDue { get; set; }
    }
}
