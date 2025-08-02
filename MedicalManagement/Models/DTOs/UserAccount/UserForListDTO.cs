namespace MedicalManagement.Models.DTOs.UserAccount
{
    public class UserForListDTO
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
