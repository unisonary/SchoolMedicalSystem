using BCrypt.Net;
using MedicalManagement.Data;
using MedicalManagement.Models.DTOs.UserAccount;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;


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
        public async Task<List<string>> ImportUsersFromExcelAsync(IFormFile file, int createdByAdminId)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;


            var result = new List<string>();

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets[0];

            var rowCount = worksheet.Dimension.Rows;

            for (int row = 2; row <= rowCount; row++) // dòng 1 là header
            {
                var dto = new ImportUserDTO
                {
                    Username = worksheet.Cells[row, 1].Text.Trim(),
                    Password = worksheet.Cells[row, 2].Text.Trim(),
                    Role = worksheet.Cells[row, 3].Text.Trim(),
                    Name = worksheet.Cells[row, 4].Text.Trim(),
                    Email = worksheet.Cells[row, 5].Text.Trim(),
                    ParentPhone = worksheet.Cells[row, 6].Text.Trim(),
                    Gender = worksheet.Cells[row, 7].Text.Trim(),
                    DateOfBirth = DateTime.TryParse(worksheet.Cells[row, 8].Text.Trim(), out var dob) ? dob : null,
                    Class = worksheet.Cells[row, 9].Text.Trim()
                };

                // Kiểm tra đã tồn tại username chưa
                if (_context.UserAccounts.Any(u => u.Username == dto.Username))
                {
                    result.Add($"Dòng {row}: Username '{dto.Username}' đã tồn tại.");
                    continue;
                }

                try
                {
                    int refId = 0;
                    switch (dto.Role)
                    {
                        case "Student":
                            // Tìm parent theo ParentPhone
                            var Parent = await _context.Parents
                                .FirstOrDefaultAsync(p => p.Phone == dto.ParentPhone);

                            if (Parent == null)
                            {
                                result.Add($"Dòng {row}: ❌ Không tìm thấy phụ huynh với số điện thoại '{dto.ParentPhone}'");
                                continue;
                            }

                            var student = new Student
                            {
                                Name = dto.Name,
                                Email = dto.Email,
                                Gender = dto.Gender,
                                DateOfBirth = dto.DateOfBirth,
                                Class = dto.Class,
                                ParentId = Parent.ParentId
                            };
                            _context.Students.Add(student);
                            await _context.SaveChangesAsync();
                            refId = student.StudentId;
                            break;
                        case "Parent":
                            var parent = new Parent { Name = dto.Name, Email = dto.Email, Phone = dto.ParentPhone };
                            result.Add($"Dòng {row}: Cell(6) = '{worksheet.Cells[row, 6].Text}'");//Debugging
                            result.Add($"Dòng {row}: Sẽ tạo parent với phone = '{dto.ParentPhone}'");//Debugging
                            _context.Parents.Add(parent);
                            await _context.SaveChangesAsync();
                            refId = parent.ParentId;
                            break;
                        case "Nurse":
                            var nurse = new SchoolNurse { Name = dto.Name, Email = dto.Email };
                            _context.SchoolNurses.Add(nurse);
                            await _context.SaveChangesAsync();
                            refId = nurse.NurseId;
                            break;
                        case "Manager":
                            var manager = new Manager { Name = dto.Name, Email = dto.Email };
                            _context.Managers.Add(manager);
                            await _context.SaveChangesAsync();
                            refId = manager.ManagerId;
                            break;
                        case "Admin":
                            var admin = new Admin { Name = dto.Name, Email = dto.Email };
                            _context.Admins.Add(admin);
                            await _context.SaveChangesAsync();
                            refId = admin.AdminId;
                            break;
                        default:
                            result.Add($"Dòng {row}: Role '{dto.Role}' không hợp lệ.");
                            continue;
                    }

                    string hashedPw = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                    var user = new UserAccount
                    {
                        Username = dto.Username,
                        Password = hashedPw,
                        Role = dto.Role,
                        ReferenceId = refId,
                        CreatedBy = createdByAdminId,
                        IsActive = true,
                        IsFirstLogin = true
                    };

                    _context.UserAccounts.Add(user);
                    await _context.SaveChangesAsync();
                    result.Add($"Dòng {row}: Thành công.");
                }
                catch (Exception ex)
                {
                    result.Add($"Dòng {row}: Lỗi - {ex.Message}");
                }
            }

            return result;
        }
    }
}
