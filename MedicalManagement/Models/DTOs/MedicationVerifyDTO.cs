namespace MedicalManagement.Models.DTOs
{
    // MedicationVerifyDTO.cs
    public class MedicationVerifyDTO
    {
        public string Status { get; set; }  //"Approved", "Rejected"
        public string? Note { get; set; }   
    }

}
