using MedicalManagement.Models.DTOs.UserAccount;
using MedicalManagement.Data;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using BCrypt.Net;

namespace MedicalManagement.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;

        public AdminService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateUserAsync(CreateUserDTO dto)
        {
            // Tạo thông tin trong bảng phụ trước (Student, Parent,...)
            int referenceId = 0;
            switch (dto.Role)
            {
                case "Student":
                    var student = new Student { Name = dto.Name, Email = dto.Email };
                    _context.Students.Add(student);
                    await _context.SaveChangesAsync();
                    referenceId = student.StudentId;
                    break;
                case "Parent":
                    var parent = new Parent { Name = dto.Name, Email = dto.Email };
                    _context.Parents.Add(parent);
                    await _context.SaveChangesAsync();
                    referenceId = parent.ParentId;
                    break;
                case "Nurse":
                    var nurse = new SchoolNurse { Name = dto.Name, Email = dto.Email };
                    _context.SchoolNurses.Add(nurse);
                    await _context.SaveChangesAsync();
                    referenceId = nurse.NurseId;
                    break;
                case "Manager":
                    var manager = new Manager { Name = dto.Name, Email = dto.Email };
                    _context.Managers.Add(manager);
                    await _context.SaveChangesAsync();
                    referenceId = manager.ManagerId;
                    break;
                case "Admin":
                    var admin = new Admin { Name = dto.Name, Email = dto.Email };
                    _context.Admins.Add(admin);
                    await _context.SaveChangesAsync();
                    referenceId = admin.AdminId;
                    break;
                default:
                    return false;
            }

            // Mã hóa mật khẩu
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Tạo tài khoản
            var user = new UserAccount
            {
                Username = dto.Username,
                Password = hashedPassword,
                Role = dto.Role,
                ReferenceId = referenceId,
                CreatedBy = dto.CreatedBy,
                IsActive = true,
                IsFirstLogin = true
            };

            _context.UserAccounts.Add(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<object>> GetUsersByRoleAsync(string role)
        {
            var query = _context.UserAccounts
                .Where(u => u.Role == role && u.IsActive);

            return await query.ToListAsync<object>();
        }

        public async Task<bool> ResetPasswordAsync(ResetUserPasswordDTO dto)
        {
            var user = await _context.UserAccounts.FindAsync(dto.UserId);
            if (user == null) return false;

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.IsFirstLogin = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
