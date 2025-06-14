using MedicalManagement.Models.Entities;

namespace MedicalManagement.Repositories
{
    public interface IMedicationRepository
    {
        Task<Medication?> GetByIdAsync(int id);
        Task<List<Medication>> GetByStudentIdsAsync(IEnumerable<int> studentIds);
        Task<List<Medication>> GetAllAsync();
        Task UpdateAsync(Medication medication);
        Task SaveChangesAsync();
    }
}
