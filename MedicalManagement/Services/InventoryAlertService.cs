using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class InventoryAlertService : IInventoryAlertService
    {
        private readonly AppDbContext _context;

        public InventoryAlertService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<InventoryItemAlertDTO>> GetAlertsAsync(string? alertType)
        {
            var today = DateTime.Today;
            var threshold = today.AddDays(30);

            var query = _context.Inventories.Where(i => i.IsActive);

            if (alertType == "LowStock")
            {
                query = query.Where(i => i.Quantity < i.MinimumStockLevel);
            }
            else if (alertType == "ExpirySoon")
            {
                query = query.Where(i => i.ExpiryDate <= threshold);
            }

            return await query.Select(i => new InventoryItemAlertDTO
            {
                ItemId = i.ItemId,
                ItemName = i.ItemName,
                ItemType = i.ItemType,
                Quantity = i.Quantity,
                MinimumStockLevel = i.MinimumStockLevel,
                ExpiryDate = i.ExpiryDate ?? DateTime.MinValue,
                AlertType = alertType ?? "Unknown"
            }).ToListAsync();
        }


        public async Task GenerateDailyInventoryAlertsAsync()
        {
            var manager = await _context.UserAccounts
                .Where(u => u.Role == "Manager")
                .FirstOrDefaultAsync();

            if (manager == null) return;

            var lowStockAlerts = await GetAlertsAsync("LowStock");
            var expiryAlerts = await GetAlertsAsync("ExpirySoon");

            foreach (var item in lowStockAlerts)
            {
                var content = $"Vật tư {item.ItemName} đã thấp hơn mức tồn kho tối thiểu ({item.Quantity}/{item.MinimumStockLevel}).";

                _context.MedicalNotifications.Add(new MedicalNotification
                {
                    StudentId = null,
                    Title = "Cảnh báo vật tư y tế",
                    Content = content,
                    NotificationType = "Inventory_Alert",
                    RecipientType = "Manager",
                    Date = DateTime.Now,
                    IsRead = false,
                    SenderId = manager.UserId
                });
            }

            foreach (var item in expiryAlerts)
            {
                var content = $"Vật tư {item.ItemName} sẽ hết hạn vào {item.ExpiryDate:dd/MM/yyyy}.";

                _context.MedicalNotifications.Add(new MedicalNotification
                {
                    StudentId = null,
                    Title = "Cảnh báo vật tư y tế",
                    Content = content,
                    NotificationType = "Inventory_Alert",
                    RecipientType = "Manager",
                    Date = DateTime.Now,
                    IsRead = false,
                    SenderId = manager.UserId
                });
            }

            await _context.SaveChangesAsync();
        }

    }


}
