using System.Text.RegularExpressions;

namespace MedicalManagement.Helpers
{
    public static class PasswordValidator
    {
        public static bool IsStrong(string password)
        {
            // Tối thiểu 8 ký tự, ít nhất 1 chữ in hoa và 1 ký tự đặc biệt  
            return Regex.IsMatch(password, @"^(?=.*[A-Z])(?=.*[\W_]).{8,}$");
        }
    }
}
