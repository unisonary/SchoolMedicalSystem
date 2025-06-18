using MedicalManagement.Data;
using MedicalManagement.Exceptions;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly AppDbContext _context;

        public InventoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<InventoryReadDTO>> GetAllAsync()
        {
            return await _context.Set<Inventory>()
                .Where(i => i.IsActive)
                .Select(i => new InventoryReadDTO
                {
                    ItemId = i.ItemId,
                    ItemName = i.ItemName,
                    ItemType = i.ItemType,
                    Quantity = i.Quantity,
                    Unit = i.Unit,
                    ExpiryDate = i.ExpiryDate,
                    MinimumStockLevel = i.MinimumStockLevel
                }).ToListAsync();
        }

        public async Task<int> CreateAsync(InventoryCreateDTO dto)
        {
            var item = new Inventory
            {
                ItemName = dto.ItemName,
                ItemType = dto.ItemType,
                Quantity = dto.Quantity,
                Unit = dto.Unit,
                ExpiryDate = dto.ExpiryDate,
                MinimumStockLevel = dto.MinimumStockLevel
            };

            _context.Add(item);
            await _context.SaveChangesAsync();
            return item.ItemId;
        }

        public async Task UpdateAsync(int id, InventoryUpdateDTO dto)
        {
            var item = await _context.Set<Inventory>().FindAsync(id);
            if (item == null || !item.IsActive) throw new NotFoundException("Không tìm thấy vật tư/thuốc.");

            item.Quantity = dto.Quantity;
            item.MinimumStockLevel = dto.MinimumStockLevel;
            await _context.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int id)
        {
            var item = await _context.Inventory.FindAsync(id);
            if (item == null || !item.IsActive)
                throw new NotFoundException("Không tìm thấy vật tư để xoá.");

            item.IsActive = false;
            await _context.SaveChangesAsync();
        }


    }

}
