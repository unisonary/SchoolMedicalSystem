using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Models.Responses
{
    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public UserDTO User { get; set; }
        public bool IsFirstLogin { get; set; }
    }
}
