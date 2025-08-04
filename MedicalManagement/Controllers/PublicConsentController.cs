using MedicalManagement.Data;
using MedicalManagement.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/public/consents")]
    public class PublicConsentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailJwtHelper _emailJwtHelper;

        public PublicConsentController(AppDbContext context, EmailJwtHelper emailJwtHelper)
        {
            _context = context;
            _emailJwtHelper = emailJwtHelper;
        }

        [HttpGet("respond")]
        public async Task<IActionResult> RespondFromEmail([FromQuery] string token)
        {
            try
            {
                var (consentId, status) = _emailJwtHelper.DecodeToken(token);

                var consent = await _context.Consents.FindAsync(consentId);
                if (consent == null || consent.ConsentStatus != "Pending")
                    return BadRequest("Yêu cầu không hợp lệ hoặc đã phản hồi.");

                // Ghi chú tự động
                var planTypeText = consent.ConsentType == "Health_Checkup"
                    ? "kế hoạch khám sức khỏe định kỳ"
                    : "kế hoạch tiêm chủng";

                string autoNote = status == "Approved"
                    ? $"Tôi đồng ý cho con tham gia vào {planTypeText}."
                    : $"Tôi không đồng ý cho con tham gia vào {planTypeText}. (Phản hồi qua email - không có lý do chi tiết)";

                consent.ConsentStatus = status;
                consent.ConsentDate = DateTime.Now;
                consent.Notes = autoNote;

                await _context.SaveChangesAsync();

                return Content(
                        $"<p>Phản hồi của bạn: <strong>{status}</strong></p><p>{autoNote}</p>",
                        "text/html; charset=utf-8"
                        );

            }
            catch (SecurityTokenException)
            {
                return BadRequest("Token không hợp lệ hoặc đã hết hạn.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }


}
