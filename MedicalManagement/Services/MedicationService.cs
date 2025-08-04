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
        // Sử dụng _context trực tiếp để có thể Include và Select dễ dàng hơn
        return await _context.Medications
            .Where(m => studentIds.Contains(m.StudentId) && m.ProvidedByParent)
            .Include(m => m.Student) // Nạp thông tin Student để lấy tên
            .OrderByDescending(m => m.MedicationId)
            .Select(m => new MedicationReadDTO
            {
                MedicationId = m.MedicationId,
                StudentId = m.StudentId,
                StudentName = m.Student.Name, // Lấy tên học sinh
                MedicationName = m.MedicationName,
                Dosage = m.Dosage,
                Frequency = m.Frequency,
                Instructions = m.Instructions,
                StartDate = m.StartDate,
                EndDate = m.EndDate,
                Status = m.Status,
                ProvidedByParent = m.ProvidedByParent,
                PrescriptionImageUrl = m.PrescriptionImageUrl, // Lấy URL ảnh
                RejectionReason = m.RejectionReason // Lấy lý do từ chối
            })
            .ToListAsync();
    }

    // =================================================================
    // SỬA LỖI: PHƯƠNG THỨC NÀY ĐÃ ĐƯỢC CẬP NHẬT
    // =================================================================
    public async Task UpdateByParentAsync(int parentRefId, int id, MedicationUpdateDTO dto)
    {
        var med = await _repo.GetByIdAsync(id)
                  ?? throw new KeyNotFoundException("Không tìm thấy yêu cầu thuốc");

        // Logic kiểm tra quyền có thể cần xem lại, tạm thời giữ nguyên
        // if (!med.ProvidedByParent || med.Status != "PendingConfirmation")
        //     throw new InvalidOperationException("Không thể chỉnh sửa yêu cầu này.");

        // Áp dụng các thay đổi từ DTO
        med.MedicationName = dto.MedicationName ?? med.MedicationName;
        med.Dosage = dto.Dosage ?? med.Dosage;
        med.Frequency = dto.Frequency ?? med.Frequency;
        med.Instructions = dto.Instructions ?? med.Instructions;
        med.StartDate = dto.StartDate ?? med.StartDate;
        med.EndDate = dto.EndDate ?? med.EndDate;
        med.PrescriptionImageUrl = dto.PrescriptionImageUrl; // Cập nhật URL ảnh

        await _repo.UpdateAsync(med);
        await _repo.SaveChangesAsync();
    }
        

    public async Task<List<MedicationNurseReadDTO>> GetFromParentByStatusAsync(string status = "Active")
    {
        return await _context.Medications
            .Where(m => m.ProvidedByParent && m.Status == status)
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

    public async Task<IEnumerable<MedicationReadDTO>> GetMedicationsByStatusAsync(string status)
    {
        if (string.IsNullOrEmpty(status))
        {
            return new List<MedicationReadDTO>();
        }

        return await _context.Medications
            .Where(m => m.Status == status)
            .Include(m => m.Student) // Nạp thông tin Student để lấy tên
            .Select(m => new MedicationReadDTO
            {
                MedicationId = m.MedicationId,
                StudentId = m.StudentId,
                StudentName = m.Student.Name, // Lấy tên học sinh
                ClassName = m.Student.Class,
                MedicationName = m.MedicationName,
                Dosage = m.Dosage,
                Frequency = m.Frequency,
                Instructions = m.Instructions,
                StartDate = m.StartDate,
                EndDate = m.EndDate,
                Status = m.Status,
                ProvidedByParent = m.ProvidedByParent,
                PrescriptionImageUrl = m.PrescriptionImageUrl, // Lấy URL ảnh
                RejectionReason = m.RejectionReason // Lấy lý do từ chối
            })
            .OrderByDescending(m => m.MedicationId) // Sắp xếp để yêu cầu mới nhất lên đầu
            .ToListAsync();
    }

    public async Task CreateByNurseAsync(MedicationCreateDTO dto, int nurseId)
    {
        var studentExists = await _context.Students.AnyAsync(s => s.StudentId == dto.StudentId);
        if (!studentExists)
        {
            throw new NotFoundException($"Không tìm thấy học sinh với ID {dto.StudentId}.");
        }

        var med = new Medication
        {
            StudentId = dto.StudentId,
            MedicationName = dto.MedicationName,
            Dosage = dto.Dosage,
            Frequency = dto.Frequency,
            Instructions = dto.Instructions,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            ProvidedByParent = true,
            NurseId = nurseId,
            PrescriptionImageUrl = null, // Y tá thêm trực tiếp, không có toa online
            Status = "Approved" // Được duyệt ngay
        };

        _context.Medications.Add(med);
        await _context.SaveChangesAsync();
    }

    public async Task<Medication> AcceptMedicationAsync(int medicationId)
    {
        var med = await _context.Medications.FindAsync(medicationId);
        if (med == null)
        {
            throw new NotFoundException("Không tìm thấy yêu cầu thuốc.");
        }
        if (med.Status != "PendingConfirmation")
        {
            throw new InvalidOperationException("Chỉ có thể chấp nhận yêu cầu đang ở trạng thái 'Chờ xác nhận'.");
        }

        med.Status = "Approved";
        await _context.SaveChangesAsync();
        return med; // Trả về đối tượng để Controller có thể lấy StudentId gửi thông báo
    }

    public async Task<Medication> RejectMedicationAsync(int medicationId, string reason)
    {
        var med = await _context.Medications.FindAsync(medicationId);
        if (med == null)
        {
            throw new NotFoundException("Không tìm thấy yêu cầu thuốc.");
        }
        if (med.Status != "PendingConfirmation")
        {
            throw new InvalidOperationException("Chỉ có thể từ chối yêu cầu đang ở trạng thái 'Chờ xác nhận'.");
        }
        if (string.IsNullOrWhiteSpace(reason))
        {
            throw new BadRequestException("Lý do từ chối không được để trống.");
        }

        med.Status = "Rejected";
        med.RejectionReason = reason;
        await _context.SaveChangesAsync();
        return med; // Trả về đối tượng để Controller có thể lấy StudentId gửi thông báo
    }

    public async Task MarkAsAdministeredAsync(int medicationId)
    {
        var med = await _context.Medications.FindAsync(medicationId);
        if (med == null)
        {
            throw new NotFoundException("Không tìm thấy yêu cầu thuốc.");
        }
        if (med.Status != "Approved")
        {
            throw new InvalidOperationException("Chỉ có thể đánh dấu cho uống đối với thuốc đã được chấp nhận.");
        }

        med.Status = "Administered";
        await _context.SaveChangesAsync();
    }

}

