using System.Security.Claims;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/nurse/medications")]
    [Authorize(Roles = "Nurse")]
    public class NurseMedicationController : ControllerBase
    {
        private readonly IMedicationService _service;
        private readonly INotificationService _notificationService; // Thêm service thông báo

        public NurseMedicationController(IMedicationService service, INotificationService notificationService)
        {
            _service = service;
            _notificationService = notificationService;
        }

        // API mới: Lấy danh sách thuốc theo trạng thái
        [HttpGet]
        public async Task<IActionResult> GetMedicationsByStatus([FromQuery] string status)
        {
            // Các status hợp lệ: PendingConfirmation, Approved, Administered, Rejected
            var list = await _service.GetMedicationsByStatusAsync(status);
            return Ok(list);
        }

        // API cũ: Y tá tự thêm thuốc (do phụ huynh mang đến)
        [HttpPost]
        public async Task<IActionResult> AddMedicationByNurse([FromBody] MedicationCreateDTO dto)
        {
            var nurseId = int.TryParse(User.FindFirstValue("reference_id"), out var id) ? id : 0;
            if (nurseId == 0)
                return Unauthorized("Không tìm được thông tin y tá.");

            await _service.CreateByNurseAsync(dto, nurseId);
            return Ok(new { message = "Đã thêm thuốc cho học sinh." });
        }

        // API mới: Chấp nhận yêu cầu thuốc
        [HttpPut("{id}/accept")]
        public async Task<IActionResult> AcceptMedication(int id)
        {
            var medication = await _service.AcceptMedicationAsync(id);
            if (medication == null) return NotFound();

            // Gửi thông báo cho phụ huynh
            await _notificationService.SendToParentAsync(
                medication.StudentId,
                "Yêu cầu gửi thuốc đã được duyệt",
                $"Yêu cầu gửi thuốc '{medication.MedicationName}' cho học sinh đã được y tá chấp nhận.",
                "Medication"
            );

            return Ok(new { message = "Đã chấp nhận thuốc." });
        }

        // API mới: Từ chối yêu cầu thuốc
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectMedication(int id, [FromBody] MedicationRejectDTO dto)
        {
            var medication = await _service.RejectMedicationAsync(id, dto.RejectionReason);
            if (medication == null) return NotFound();

            // Gửi thông báo cho phụ huynh
            await _notificationService.SendToParentAsync(
                medication.StudentId,
                "Yêu cầu gửi thuốc bị từ chối",
                $"Yêu cầu gửi thuốc '{medication.MedicationName}' đã bị từ chối. Lý do: {dto.RejectionReason}",
                "Medication"
            );

            return Ok(new { message = "Đã từ chối yêu cầu." });
        }

        // API cũ: Đánh dấu đã cho uống
        [HttpPut("{id}/administer")]
        public async Task<IActionResult> MarkAsAdministered(int id)
        {
            await _service.MarkAsAdministeredAsync(id);
            return Ok(new { message = "Đã đánh dấu cho uống thành công." });
        }
    }
}
