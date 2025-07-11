using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class ParentStudentService : IParentStudentService
    {
        private readonly AppDbContext _context;

        public ParentStudentService(AppDbContext context)
        {
            _context = context;
        }

        private async Task<List<int>> GetStudentIdsFromUsernameAsync(string username)
        {
            var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.Username == username && u.Role == "Parent");
            if (user == null) return new List<int>();

            return await _context.Students
                .Where(s => s.ParentId == user.ReferenceId)
                .Select(s => s.StudentId)
                .ToListAsync();
        }

        public async Task<List<MedicalEventDTO>> GetMedicalEventsAsync(string username)
        {
            var studentIds = await GetStudentIdsFromUsernameAsync(username);

            return await _context.MedicalEvents
                .Include(e => e.Student)
                .Include(e => e.Nurse)
                .Where(e => studentIds.Contains(e.StudentId))
                .Select(e => new MedicalEventDTO
                {
                    EventId = e.EventId,
                    StudentId = e.StudentId,
                    StudentName = e.Student.Name,
                    EventType = e.EventType,
                    Description = e.Description,
                    Date = e.Date,
                    NurseName = e.Nurse.Name
                })
                .ToListAsync();
        }

        public async Task<List<HealthCheckupDTO>> GetHealthCheckupsAsync(string username)
        {
            var studentIds = await GetStudentIdsFromUsernameAsync(username);

            return await _context.HealthCheckups
                .Include(c => c.Student)
                .Where(c => studentIds.Contains(c.StudentId))
                .Select(c => new HealthCheckupDTO
                {
                    CheckupId = c.CheckupId,
                    StudentId = c.StudentId,
                    StudentName = c.Student.Name,
                    Result = c.Result,
                    Date = c.Date,
                    Recommendations = c.Recommendations
                })
                .ToListAsync();
        }

        public async Task<List<MedicalNotificationDTO>> GetMedicalNotificationsAsync(string username)
        {
            var studentIds = await GetStudentIdsFromUsernameAsync(username);

            return await _context.MedicalNotifications
                .Where(n => n.StudentId.HasValue && studentIds.Contains(n.StudentId.Value) && n.RecipientType == "Parent")
                .Include(n => n.Student)
                .Select(n => new MedicalNotificationDTO
                {
                    NotificationId = n.NotificationId,
                    StudentId = n.StudentId.Value,
                    StudentName = n.Student != null ? n.Student.Name : "",
                    Title = n.Title,
                    Content = n.Content,
                    Date = n.Date,
                    IsRead = n.IsRead,
                    Priority = n.Priority  
                })

                .ToListAsync();
        }

        public async Task<bool> MarkNotificationAsReadAsync(string username, int id)
        {
            var studentIds = await GetStudentIdsFromUsernameAsync(username);

            var notification = await _context.MedicalNotifications
                .FirstOrDefaultAsync(n => n.NotificationId == id && n.StudentId.HasValue && studentIds.Contains(n.StudentId.Value));

            if (notification == null)
                return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> MarkAllNotificationsAsReadAsync(string username)
        {
            var studentIds = await GetStudentIdsFromUsernameAsync(username);

            var unreadNotifications = await _context.MedicalNotifications
                .Where(n => n.StudentId.HasValue && studentIds.Contains(n.StudentId.Value) && !n.IsRead)
                .ToListAsync();

            foreach (var n in unreadNotifications)
            {
                n.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return unreadNotifications.Count;
        }

    }

}
