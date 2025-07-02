using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IUserProfileService
    {
        Task<UserProfileDTO> GetUserProfileAsync(int userId);
    }
}
