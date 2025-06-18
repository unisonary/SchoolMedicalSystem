namespace MedicalManagement.Models.DTOs.UserAccount
{
    public class ResetUserPasswordDTO
    {
        public int UserId { get; set; }
        public string NewPassword { get; set; }
    }
}
