using MedicalManagement.Data;
using MedicalManagement.Exceptions;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class VaccinationService : IVaccinationService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notification;

        public VaccinationService(AppDbContext context, INotificationService notification)
        {
            _context = context;
            _notification = notification;
        }

        public async Task<List<VaccinationReadDTO>> GetAllAsync()
        {
            return await _context.Vaccinations
                .Include(v => v.Student)
                .Select(v => new VaccinationReadDTO
                {
                    VaccinationId = v.VaccinationId,
                    StudentName = v.Student.Name,
                    VaccineName = v.VaccineName,
                    BatchNumber = v.BatchNumber,
                    Date = v.Date,
                    Reaction = v.Reaction,
                    NextDoseDue = v.NextDoseDue
                }).ToListAsync();
        }

        public async Task<int> CreateAsync(VaccinationCreateDTO dto, int nurseId)
        {
            var student = await _context.Students.FindAsync(dto.StudentId);
            if (student == null)
                throw new NotFoundException("Học sinh không tồn tại.");

            var plan = await _context.MedicalPlans.FindAsync(dto.PlanId);
            if (plan == null)
                throw new NotFoundException("Không tìm thấy kế hoạch tiêm chủng.");

            var vac = new Vaccination
            {
                StudentId = dto.StudentId,
                PlanId = dto.PlanId,
                VaccineName = dto.VaccineName,
                BatchNumber = dto.BatchNumber,
                Date = dto.Date,
                Reaction = dto.Reaction,
                NextDoseDue = dto.NextDoseDue,
                NurseId = nurseId
            };

            _context.Vaccinations.Add(vac);
            await _context.SaveChangesAsync();

            await _notification.SendToParentAsync(dto.StudentId,
                "Kết quả tiêm chủng",
                $"Học sinh đã tiêm vắc xin {dto.VaccineName}.",
                "Vaccination");

            return vac.VaccinationId;
        }

        public async Task UpdateAsync(int id, VaccinationUpdateDTO dto, int nurseId)
        {
            var vac = await _context.Vaccinations.FindAsync(id);
            if (vac == null) throw new NotFoundException("Không tìm thấy bản ghi tiêm chủng.");

            vac.Reaction = dto.Reaction ?? vac.Reaction;
            vac.NextDoseDue = dto.NextDoseDue ?? vac.NextDoseDue;

            await _context.SaveChangesAsync();
        }

    }

}
