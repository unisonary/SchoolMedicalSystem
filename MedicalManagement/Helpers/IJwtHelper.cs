using MedicalManagement.Models.Entities;

namespace MedicalManagement.Helpers
{
    public interface IJwtHelper
    {
        string GenerateToken(UserAccount user);
    }
}
