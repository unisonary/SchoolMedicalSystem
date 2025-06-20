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

        public async Task<List<VaccinationReadDTO>> GetAllAsync(int? planId = null)
        {
            var query = _context.Vaccinations
                .Include(v => v.Student)
                .AsQueryable();

            if (planId != null)
                query = query.Where(v => v.PlanId == planId);

            return await query
                .Select(v => new VaccinationReadDTO
                {
                    VaccinationId = v.VaccinationId,
                    StudentName = v.Student.Name,
                    VaccineName = v.VaccineName ?? "", 
                    BatchNumber = v.BatchNumber ?? "",
                    Date = v.Date == DateTime.MinValue ? null : v.Date,
                    Reaction = v.Reaction ?? "",
                    NextDoseDue = v.NextDoseDue
                })
                .ToListAsync();
        }

        public async Task UpdateAsync(int id, VaccinationUpdateDTO dto, int nurseId)
        {
            var vac = await _context.Vaccinations.FindAsync(id);
            if (vac == null || vac.NurseId != nurseId)
                throw new NotFoundException("Không tìm thấy bản ghi hoặc bạn không có quyền.");

            vac.VaccineName = dto.VaccineName ?? vac.VaccineName;
            vac.BatchNumber = dto.BatchNumber ?? vac.BatchNumber;
            vac.Date = DateTime.Now; // Thời điểm thực tiêm
            vac.Reaction = dto.Reaction ?? vac.Reaction;
            vac.NextDoseDue = dto.NextDoseDue ?? vac.NextDoseDue;

            await _context.SaveChangesAsync();

            var studentName = await _context.Students
            .Where(s => s.StudentId == vac.StudentId)
            .Select(s => s.Name)
            .FirstOrDefaultAsync() ?? "Không rõ";

            var reaction = string.IsNullOrWhiteSpace(vac.Reaction) ? "Không có phản ứng" : vac.Reaction;

            await _notification.SendToParentAsync(
                vac.StudentId,
                "Kết quả tiêm chủng",
                $"Học sinh {studentName} đã tiêm vắc xin {vac.VaccineName}. Phản ứng ghi nhận: {reaction}.",
                "Vaccination"
            );

        }



    }

}
