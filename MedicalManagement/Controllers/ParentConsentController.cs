using MedicalManagement.Helpers;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/parent/consents")]
    [Authorize(Roles = "Parent")]
    public class ParentConsentController : ControllerBase
    {
        private readonly IConsentService _service;

        public ParentConsentController(IConsentService service)
        {
            _service = service;
        }

        private int GetParentId()
        {
            var raw = User.FindFirstValue(JwtClaimTypes.ReferenceId); 
            return int.TryParse(raw, out var id) ? id : throw new UnauthorizedAccessException();
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            int parentId = GetParentId();
            var data = await _service.GetPendingConsentsAsync(parentId);
            return Ok(data);
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            int parentId = GetParentId();
            var data = await _service.GetConsentHistoryAsync(parentId);
            return Ok(data);
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> RespondToConsent(int id, [FromBody] ConsentActionDTO dto)
        {
            int parentId = GetParentId();
            try
            {
                await _service.RespondToConsentAsync(id, parentId, dto);

                string responseMessage = dto.ConsentStatus == "Approved"
                    ? "Đã chấp nhận yêu cầu. Đã tạo dữ liệu y tế ban đầu cho kế hoạch."
                    : "Đã từ chối yêu cầu xác nhận.";

                return Ok(new { message = responseMessage });
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(403, new { message = "Bạn không có quyền phản hồi yêu cầu này." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }


    }
}
