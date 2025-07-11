using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly AppDbContext _context;

        public UserProfileService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserProfileDTO> GetUserProfileAsync(int userId)
        {
            var account = await _context.UserAccounts.FindAsync(userId);
            if (account == null) throw new Exception("User not found");

            object profile = account.Role.ToLower() switch
            {
                "parent" => await _context.Parents
                    .Where(p => p.ParentId == account.ReferenceId)
                    .Select(p => new ParentProfileDTO
                    {
                        Name = p.Name,
                        Phone = p.Phone,
                        Email = p.Email
                    }).FirstOrDefaultAsync(),

                "student" => await _context.Students
                    .Where(s => s.StudentId == account.ReferenceId)
                    .Select(s => new StudentProfileDTO
                    {
                        Name = s.Name,
                        Gender = s.Gender,
                        DateOfBirth = s.DateOfBirth,
                        Class = s.Class,
                        Email = s.Email
                    }).FirstOrDefaultAsync(),

                "school_nurse" or "nurse" => await _context.SchoolNurses
                    .Where(n => n.NurseId == account.ReferenceId)
                    .Select(n => new SchoolNurseProfileDTO
                    {
                        Name = n.Name,
                        Email = n.Email,
                        Specialization = n.Specialization
                    }).FirstOrDefaultAsync(),

                "manager" => await _context.Managers
                    .Where(m => m.ManagerId == account.ReferenceId)
                    .Select(m => new ManagerProfileDTO
                    {
                        Name = m.Name,
                        Email = m.Email,
                        Department = m.Department,
                        Position = m.Position
                    }).FirstOrDefaultAsync(),

                "admin" => await _context.Admins
                    .Where(a => a.AdminId == account.ReferenceId)
                    .Select(a => new AdminProfileDTO
                    {
                        Name = a.Name,
                        Email = a.Email
                    }).FirstOrDefaultAsync(),

                _ => throw new Exception("Invalid role")
            };

            return new UserProfileDTO
            {
                Role = account.Role,
                Profile = profile,
                CreatedAt = account.CreatedDate  
            };
        }


    }
}
