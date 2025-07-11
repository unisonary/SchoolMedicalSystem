namespace MedicalManagement.Models.DTOs
{
    public class UserProfileDTO
    {
        public string Role { get; set; }
        public object Profile { get; set; }
        public DateTime? CreatedAt { get; set; }
    }


}
