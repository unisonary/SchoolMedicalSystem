using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MedicalNotificationDTO>> GetManagerNotificationsAsync()
        {
            return await _context.MedicalNotifications
                .Where(n => n.RecipientType == "Manager")
                .OrderByDescending(n => n.Date)
                .Select(n => new MedicalNotificationDTO
                {
                    NotificationId = n.NotificationId,
                    Title = n.Title,
                    Content = n.Content,
                    Date = n.Date,
                    IsRead = n.IsRead,
                    Priority = n.Priority,
                    StudentId = n.StudentId ?? 0, // Optional: fallback nếu cần
                    StudentName = n.Student != null ? n.Student.Name : ""
                })
                .ToListAsync();
        }

        public async Task<bool> MarkManagerNotificationAsReadAsync(int id)
        {
            var notification = await _context.MedicalNotifications
                .FirstOrDefaultAsync(n => n.NotificationId == id && n.RecipientType == "Manager");

            if (notification == null) return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> MarkAllManagerNotificationsAsReadAsync()
        {
            var unread = await _context.MedicalNotifications
                .Where(n => n.RecipientType == "Manager" && !n.IsRead)
                .ToListAsync();

            foreach (var n in unread)
                n.IsRead = true;

            await _context.SaveChangesAsync();
            return unread.Count;
        }

        public async Task SendToParentAsync(int studentId, string title, string content, string type)
        {
            var student = await _context.Students.FindAsync(studentId);
            if (student?.ParentId == null) return;

            var senderUserId = await _context.UserAccounts
                .Where(u => u.ReferenceId == studentId && u.Role == "Nurse")
                .Select(u => u.UserId)
                .FirstOrDefaultAsync();

            var noti = new MedicalNotification
            {
                StudentId = studentId,
                Title = title,
                Content = content,
                NotificationType = type,
                RecipientType = "Parent",
                Date = DateTime.Now,
                IsRead = false,
                SenderId = senderUserId,
                Priority = "Normal"
            };

            _context.MedicalNotifications.Add(noti);
            await _context.SaveChangesAsync();
        }

    }
}
