using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;

namespace MedicalManagement.Services.Interfaces
{
    public interface IMedicationService
    {
        // =================================================================
        // Chức năng dành cho Phụ Huynh
        // =================================================================

        /// <summary>
        /// Lấy danh sách tất cả các yêu cầu thuốc do phụ huynh tạo.
        /// </summary>
        Task<IEnumerable<MedicationReadDTO>> GetForParentAsync(int parentRefId, IEnumerable<int> studentIds);

        /// <summary>
        /// Phụ huynh cập nhật một yêu cầu thuốc đang ở trạng thái "Chờ xác nhận".
        /// </summary>
        Task UpdateByParentAsync(int parentRefId, int id, MedicationUpdateDTO dto);

        // =================================================================
        // Chức năng dành cho Y tá
        // =================================================================

        /// <summary>
        /// Lấy danh sách các yêu cầu thuốc dựa trên một trạng thái cụ thể (PendingConfirmation, Approved, etc.).
        /// </summary>
        Task<IEnumerable<MedicationReadDTO>> GetMedicationsByStatusAsync(string status);

        /// <summary>
        /// Y tá tự tạo một yêu cầu thuốc (khi phụ huynh mang thuốc đến trực tiếp).
        /// Yêu cầu này sẽ có trạng thái "Approved" ngay lập tức.
        /// </summary>
        Task CreateByNurseAsync(MedicationCreateDTO dto, int nurseId);

        /// <summary>
        /// Y tá chấp nhận một yêu cầu gửi thuốc từ phụ huynh.
        /// Chuyển trạng thái từ "PendingConfirmation" sang "Approved".
        /// </summary>
        /// <returns>Đối tượng Medication đã được cập nhật để gửi thông báo.</returns>
        Task<Medication> AcceptMedicationAsync(int medicationId);

        /// <summary>
        /// Y tá từ chối một yêu cầu gửi thuốc từ phụ huynh.
        /// Chuyển trạng thái từ "PendingConfirmation" sang "Rejected".
        /// </summary>
        /// <returns>Đối tượng Medication đã được cập nhật để gửi thông báo.</returns>
        Task<Medication> RejectMedicationAsync(int medicationId, string reason);

        /// <summary>
        /// Y tá đánh dấu một liều thuốc đã được cho học sinh uống.
        /// Chuyển trạng thái từ "Approved" sang "Administered".
        /// </summary>
        Task MarkAsAdministeredAsync(int medicationId);
    }
}
