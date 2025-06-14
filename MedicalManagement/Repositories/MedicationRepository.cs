using MedicalManagement.Data;
using MedicalManagement.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Repositories
{
    public class MedicationRepository : IMedicationRepository
    {
        private readonly AppDbContext _ctx;
        public MedicationRepository(AppDbContext ctx) => _ctx = ctx;

        public async Task<Medication?> GetByIdAsync(int id) =>
            await _ctx.Medications.FindAsync(id);

        public async Task<List<Medication>> GetByStudentIdsAsync(IEnumerable<int> studentIds) =>
            await _ctx.Medications
                      .Where(m => studentIds.Contains(m.StudentId))
                      .ToListAsync();

        public async Task<List<Medication>> GetAllAsync() =>
            await _ctx.Medications.ToListAsync();

        public Task UpdateAsync(Medication medication)
        {
            _ctx.Medications.Update(medication);
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync() =>
            _ctx.SaveChangesAsync();
    }
}
