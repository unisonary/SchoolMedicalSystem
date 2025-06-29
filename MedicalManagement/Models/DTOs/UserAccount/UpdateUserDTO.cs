namespace MedicalManagement.Models.DTOs.UserAccount
{
    public class UpdateUserDTO
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
    }
}