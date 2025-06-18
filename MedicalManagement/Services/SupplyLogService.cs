using MedicalManagement.Data;
using MedicalManagement.Exceptions;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class SupplyLogService : ISupplyLogService
    {
        private readonly AppDbContext _context;

        public SupplyLogService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SupplyLogReadDTO>> GetAllAsync()
        {
            return await _context.SupplyLogs
                .Include(l => l.InventoryItem)
                .Include(l => l.MedicalEvent)
                .Include(l => l.MedicalEvent.Nurse)
                .Join(_context.UserAccounts,
                    log => log.UserId,
                    user => user.UserId,
                    (log, user) => new { log, user })
                .Select(x => new SupplyLogReadDTO
                {
                    LogId = x.log.LogId,
                    ItemName = x.log.InventoryItem.ItemName,
                    NurseName = x.user.Username,
                    Action = x.log.Action,
                    Quantity = x.log.Quantity,
                    Reason = x.log.Reason,
                    Date = x.log.Date,
                    ReferenceEventId = x.log.ReferenceEventId
                })
                .ToListAsync();
        }


        public async Task CreateAsync(SupplyLogCreateDTO dto, int nurseUserId)
        {
            var item = await _context.Set<Inventory>().FindAsync(dto.ItemId);
            if (item == null || !item.IsActive)
                throw new NotFoundException("Không tìm thấy vật tư.");

            var ev = await _context.MedicalEvents.FindAsync(dto.ReferenceEventId);
            if (ev == null || !ev.IsActive)
                throw new NotFoundException("Không tìm thấy sự kiện.");

            if (item.Quantity < dto.Quantity)
                throw new InvalidOperationException("Số lượng không đủ.");

            item.Quantity -= dto.Quantity;

            var userId = await _context.UserAccounts
            .Where(u => u.ReferenceId == nurseUserId && u.Role == "Nurse")
            .Select(u => u.UserId)
            .FirstOrDefaultAsync();

            if (userId == 0)
                throw new NotFoundException("Không tìm thấy tài khoản y tá để ghi log.");


            var log = new SupplyLog 
            {
                ItemId = dto.ItemId,
                UserId = userId,
                Action = "used",
                Quantity = dto.Quantity,
                Reason = dto.Reason,
                Date = DateTime.Now,
                ReferenceEventId = dto.ReferenceEventId
            };

            _context.Add(log);
            await _context.SaveChangesAsync();
        }
    }

}
