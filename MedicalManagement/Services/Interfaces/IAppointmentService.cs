using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IAppointmentService
    {
        Task CreateAppointmentAsync(int parentId, AppointmentCreateDTO dto);
        Task<List<AppointmentReadDTO>> GetAppointmentsAsync(int parentId);
    }
}
