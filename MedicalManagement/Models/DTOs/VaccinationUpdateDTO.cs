namespace MedicalManagement.Models.DTOs
{
    public class VaccinationUpdateDTO
    {
        public string? Reaction { get; set; }
        public DateTime? NextDoseDue { get; set; }
    }
}
