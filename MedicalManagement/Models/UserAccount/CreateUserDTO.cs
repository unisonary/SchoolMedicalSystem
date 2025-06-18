namespace MedicalManagement.Models.DTOs.UserAccount
{
    public class CreateUserDTO
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Role { get; set; } // Student, Parent, Nurse, Manager, Admin
        public string Name { get; set; }
        public string Email { get; set; }
        public int CreatedBy { get; set; } // admin id (user_id)
    }
}
