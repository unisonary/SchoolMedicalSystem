using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IAppointmentService
    {
        Task<List<AppointmentReadDTO>> GetAllAsync(string? status = null);
        Task UpdateAsync(int id, AppointmentUpdateDTO dto, int nurseId);
        Task CreateAsync(AppointmentCreateDTO dto, int nurseId); 
    }

}
