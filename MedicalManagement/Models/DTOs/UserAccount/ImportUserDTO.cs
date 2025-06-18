namespace MedicalManagement.Models.DTOs.UserAccount
{
    public class ImportUserDTO
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Role { get; set; } // Student, Parent
        public string Name { get; set; }
        public string Email { get; set; }
        public string ParentPhone { get; set; } // Optional, only for Student
    }
}
