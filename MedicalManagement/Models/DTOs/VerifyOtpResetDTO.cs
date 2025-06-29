namespace MedicalManagement.Models.DTOs
{
    public class VerifyOtpResetDTO
    {
        public string Email { get; set; }
        public string Otp { get; set; }
        public string NewPassword { get; set; }
    }


}
