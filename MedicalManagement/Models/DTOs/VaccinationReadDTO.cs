namespace MedicalManagement.Models.DTOs
{
    public class VaccinationReadDTO
    {
        public int VaccinationId { get; set; }
        public string StudentName { get; set; }
        public string? VaccineName { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? Date { get; set; }
        public string? Reaction { get; set; }
        public DateTime? NextDoseDue { get; set; }
    }

}
