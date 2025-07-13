namespace MedicalManagement.Models.DTOs.UserAccount
{
    public class CreateUserDTO
    {
        public string Username { get; set; }
        public string? Password { get; set; } // Nếu không nhập thì BE sẽ gán "123456"
        public string Role { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public int CreatedBy { get; set; }

        // Student
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Class { get; set; }
        public int? ParentId { get; set; }

        // Parent
        public string? Phone { get; set; }

        // Nurse
        public string? Specialization { get; set; }

        // Manager
        public string? Department { get; set; }
        public string? Position { get; set; }
    }
}
