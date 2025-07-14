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
using MedicalManagement.Helpers;
using System.Globalization;
using ClosedXML.Excel;


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
            int referenceId = 0;

            switch (dto.Role)
            {
                case "Student":
                    if (string.IsNullOrEmpty(dto.Gender) || dto.DateOfBirth == null || string.IsNullOrEmpty(dto.Class))
                        return false;

                    var student = new Student
                    {
                        Name = dto.Name,
                        Email = dto.Email,
                        Gender = dto.Gender,
                        DateOfBirth = dto.DateOfBirth.Value,
                        Class = dto.Class,
                        ParentId = dto.ParentId.Value
                    };
                    _context.Students.Add(student);
                    await _context.SaveChangesAsync();
                    referenceId = student.StudentId;
                    break;

                case "Parent":
                    var existingParent = await _context.Parents.FirstOrDefaultAsync(p => p.Phone == dto.Phone);
                    if (existingParent != null)
                        throw new InvalidOperationException($"Phụ huynh với số điện thoại {dto.Phone} đã tồn tại.");

                    var parent = new Parent
                    {
                        Name = dto.Name,
                        Email = dto.Email,
                        Phone = dto.Phone
                    };
                    _context.Parents.Add(parent);
                    await _context.SaveChangesAsync();
                    referenceId = parent.ParentId;
                    break;


                case "Nurse":
                    var nurse = new SchoolNurse
                    {
                        Name = dto.Name,
                        Email = dto.Email,
                        Specialization = dto.Specialization
                    };
                    _context.SchoolNurses.Add(nurse);
                    await _context.SaveChangesAsync();
                    referenceId = nurse.NurseId;
                    break;

                case "Manager":
                    var manager = new Manager
                    {
                        Name = dto.Name,
                        Email = dto.Email,
                        Department = dto.Department,
                        Position = dto.Position
                    };
                    _context.Managers.Add(manager);
                    await _context.SaveChangesAsync();
                    referenceId = manager.ManagerId;
                    break;

                case "Admin":
                    var admin = new Admin
                    {
                        Name = dto.Name,
                        Email = dto.Email
                    };
                    _context.Admins.Add(admin);
                    await _context.SaveChangesAsync();
                    referenceId = admin.AdminId;
                    break;

                default:
                    return false;
            }

            // Mặc định mật khẩu là 123456 nếu không nhập
            string password = string.IsNullOrEmpty(dto.Password) ? "123456" : dto.Password;
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

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

            // Kiểm tra mật khẩu mạnh
            if (!PasswordValidator.IsStrong(dto.NewPassword))
                throw new ArgumentException("Mật khẩu phải có ít nhất 8 ký tự, 1 chữ in hoa và 1 ký tự đặc biệt.");

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.IsFirstLogin = true;
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> UpdateUserAsync(UpdateUserDTO dto)
        {
            var user = await _context.UserAccounts.FindAsync(dto.UserId);
            if (user == null) return false;

            user.Username = dto.Username;
            user.Role = dto.Role;
            user.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeactivateUserAsync(int userId)
        {
            var user = await _context.UserAccounts.FindAsync(userId);
            if (user == null) return false;

            user.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<object>> SearchUsersAsync(string query)
        {
            return await _context.UserAccounts
                .Where(u => u.Username.Contains(query))
                .ToListAsync<object>();
        }
        public async Task<List<string>> ImportUsersFromExcelWithClosedXmlAsync(IFormFile file, int createdByAdminId)
        {
            var result = new List<string>();

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheet(1);

            var rowCount = worksheet.LastRowUsed().RowNumber();

            for (int row = 2; row <= rowCount; row++)
            {
                ImportUserDTO? dto = null;
                try
                {
                    // Bước 1: Đọc dữ liệu từ file Excel
                    dto = new ImportUserDTO
                    {
                        Username = worksheet.Cell(row, 1).GetValue<string>().Trim(),
                        Password = worksheet.Cell(row, 2).GetValue<string>().Trim(),
                        Role = worksheet.Cell(row, 3).GetValue<string>().Trim(),
                        Name = worksheet.Cell(row, 4).GetValue<string>().Trim(),
                        Email = worksheet.Cell(row, 5).GetValue<string>().Trim(),
                        ParentPhone = worksheet.Cell(row, 6).GetValue<string>().Trim(),
                        Gender = worksheet.Cell(row, 7).GetValue<string>().Trim(),
                        DateOfBirth = DateTime.TryParse(worksheet.Cell(row, 8).GetValue<string>(), out var dob) ? dob : null,
                        Class = worksheet.Cell(row, 9).GetValue<string>().Trim()
                    };

                    // Bước 2: Kiểm tra trùng username
                    if (_context.UserAccounts.Any(u => u.Username == dto.Username))
                    {
                        result.Add($"Dòng {row}: ❌ Username '{dto.Username}' đã tồn tại.");
                        continue;
                    }

                    // Bước 3: Tạo entity theo Role
                    int refId = 0;
                    switch (dto.Role)
                    {
                        case "Parent":
                            var parent = new Parent
                            {
                                Name = dto.Name,
                                Email = dto.Email,
                                Phone = dto.ParentPhone
                            };
                            _context.Parents.Add(parent);
                            await _context.SaveChangesAsync();
                            refId = parent.ParentId;
                            break;

                        case "Student":
                            var parentMatch = await _context.Parents.FirstOrDefaultAsync(p => p.Phone == dto.ParentPhone);
                            if (parentMatch == null)
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
                                ParentId = parentMatch.ParentId
                            };
                            _context.Students.Add(student);
                            await _context.SaveChangesAsync();
                            refId = student.StudentId;
                            break;

                        case "Nurse":
                            var nurse = new SchoolNurse
                            {
                                Name = dto.Name,
                                Email = dto.Email
                            };
                            _context.SchoolNurses.Add(nurse);
                            await _context.SaveChangesAsync();
                            refId = nurse.NurseId;
                            break;

                        case "Manager":
                            var manager = new Manager
                            {
                                Name = dto.Name,
                                Email = dto.Email
                            };
                            _context.Managers.Add(manager);
                            await _context.SaveChangesAsync();
                            refId = manager.ManagerId;
                            break;

                        case "Admin":
                            var admin = new Admin
                            {
                                Name = dto.Name,
                                Email = dto.Email
                            };
                            _context.Admins.Add(admin);
                            await _context.SaveChangesAsync();
                            refId = admin.AdminId;
                            break;

                        default:
                            result.Add($"Dòng {row}: ❌ Role '{dto.Role}' không hợp lệ.");
                            continue;
                    }

                    // Bước 4: Tạo UserAccount
                    var userAccount = new UserAccount
                    {
                        Username = dto.Username,
                        Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                        Role = dto.Role,
                        ReferenceId = refId,
                        CreatedBy = createdByAdminId,
                        IsActive = true,
                        IsFirstLogin = true
                    };

                    _context.UserAccounts.Add(userAccount);
                    await _context.SaveChangesAsync();

                    result.Add($"Dòng {row}: ✅ Thành công.");
                }
                catch (DbUpdateException dbEx)
                {
                    var innerMsg = dbEx.InnerException?.Message ?? dbEx.Message;
                    result.Add($"Dòng {row}: ❌ Lỗi khi lưu DB - {innerMsg}");
                    if (dto != null)
                    {
                        result.Add($"→ Dữ liệu: Username = {dto.Username}, Role = {dto.Role}, Email = {dto.Email}, Phone = {dto.ParentPhone}");
                    }
                }
                catch (Exception ex)
                {
                    result.Add($"Dòng {row}: ❌ Lỗi không xác định - {ex.Message}");
                }
            }

            return result;
        }



    }
}