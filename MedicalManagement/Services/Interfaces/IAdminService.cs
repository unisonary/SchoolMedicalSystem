using MedicalManagement.Models.DTOs.UserAccount;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace MedicalManagement.Services.Interfaces
{
    public interface IAdminService
    {
        Task<bool> CreateUserAsync(CreateUserDTO dto);
        Task<List<object>> GetUsersByRoleAsync(string role);
        Task<bool> ResetPasswordAsync(ResetUserPasswordDTO dto);
        Task<List<string>> ImportUsersFromExcelAsync(IFormFile file, int createdByAdminId);
        Task<bool> UpdateUserAsync(UpdateUserDTO dto);
        Task<bool> DeactivateUserAsync(int userId);
        Task<List<object>> SearchUsersAsync(string query);

    }
}
