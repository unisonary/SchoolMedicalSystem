using MedicalManagement.Data;
using MedicalManagement.Exceptions;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Repositories;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

public class MedicationService : IMedicationService
{
    private readonly IMedicationRepository _repo;
    private readonly AppDbContext _context;

    public MedicationService(AppDbContext context, IMedicationRepository repo)
    {
        _context = context;
        _repo = repo;
    }


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

    public async Task<List<MedicationNurseReadDTO>> GetPendingFromParentAsync()
    {
        return await _context.Medications
            .Where(m => m.ProvidedByParent && m.Status == "Pending")
            .Include(m => m.Student)
            .Select(m => new MedicationNurseReadDTO
            {
                MedicationId = m.MedicationId,
                StudentName = m.Student.Name,
                MedicationName = m.MedicationName,
                Dosage = m.Dosage,
                Frequency = m.Frequency,
                Instructions = m.Instructions,
                StartDate = m.StartDate,
                EndDate = m.EndDate,
                Status = m.Status,
                Note = m.Note
            }).ToListAsync();
    }

    public async Task VerifyAsync(int medicationId, MedicationVerifyDTO dto, int nurseId)
    {
        var medication = await _context.Medications.FindAsync(medicationId);
        if (medication == null || !medication.ProvidedByParent)
            throw new NotFoundException("Thuốc không tồn tại hoặc không phải do phụ huynh gửi.");

        medication.Status = dto.Status;
        medication.Note = dto.Note;
        medication.NurseId = nurseId;

        await _context.SaveChangesAsync();
    }

}
