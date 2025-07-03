using MedicalManagement.Data;
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
