using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Repositories;
using MedicalManagement.Services.Interfaces;

public class MedicationService : IMedicationService
{
    private readonly IMedicationRepository _repo;
    public MedicationService(IMedicationRepository repo) => _repo = repo;

    public async Task<IEnumerable<MedicationReadDTO>> GetForParentAsync(int parentRefId, IEnumerable<int> studentIds)
    {
        var meds = await _repo.GetByStudentIdsAsync(studentIds);
        return meds
            .Where(m => m.ProvidedByParent && m.Status == "Active")
            .Select(MapToDto);
    }

    public async Task UpdateByParentAsync(int parentRefId, int id, MedicationUpdateDTO dto)
    {
        var med = await _repo.GetByIdAsync(id)
                  ?? throw new KeyNotFoundException("Medication not found");
        if (!med.ProvidedByParent || med.Status != "Active")
            throw new InvalidOperationException("Không thể chỉnh sửa");
        // Áp update
        med.MedicationName = dto.MedicationName ?? med.MedicationName;
        med.Dosage = dto.Dosage ?? med.Dosage;
        med.Frequency = dto.Frequency ?? med.Frequency;
        med.Instructions = dto.Instructions ?? med.Instructions;
        med.StartDate = dto.StartDate ?? med.StartDate;
        med.EndDate = dto.EndDate ?? med.EndDate;
        await _repo.UpdateAsync(med);
        await _repo.SaveChangesAsync();
    }

    public async Task<IEnumerable<MedicationReadDTO>> GetForNurseAsync()
    {
        var meds = await _repo.GetAllAsync();
        return meds.Select(MapToDto);
    }

    public async Task UpdateByNurseAsync(int nurseRefId, int id, NurseMedicationUpdateDTO dto)
    {
        var med = await _repo.GetByIdAsync(id)
                  ?? throw new KeyNotFoundException("Medication not found");
        // Nurse có thể update status, assign nurseId...
        med.Status = dto.Status ?? med.Status;
        med.NurseId = nurseRefId;
        await _repo.UpdateAsync(med);
        await _repo.SaveChangesAsync();
    }

    private MedicationReadDTO MapToDto(Medication m) => new MedicationReadDTO
    {
        MedicationId = m.MedicationId,
        StudentId = m.StudentId,
        MedicationName = m.MedicationName,
        Dosage = m.Dosage,
        Frequency = m.Frequency,
        Instructions = m.Instructions,
        StartDate = m.StartDate,
        EndDate = m.EndDate,
        Status = m.Status
    };
}
