using System.Security.Claims;
using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/manager/plans")]
    [Authorize(Roles = "Manager")]
    public class ManagerMedicalPlanController : ControllerBase
    {
        private readonly IMedicalPlanService _service;
        private readonly AppDbContext _context;

        public ManagerMedicalPlanController(IMedicalPlanService service, AppDbContext context)
        {
            _service = service;
            _context = context;
        }


        private int GetManagerId() => int.Parse(User.FindFirstValue("reference_id"));

        [HttpGet("classes")]
        public async Task<IActionResult> GetClasses()
        {
            var classes = await _context.Students
                .Where(s => s.Class != null)
                .Select(s => s.Class)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(classes);
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MedicalPlanCreateDTO dto)
        {
            var id = await _service.CreateAsync(dto, GetManagerId());
            return Ok(new { message = "Đã tạo kế hoạch y tế.", planId = id });
        }

        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _service.GetAllAsync());

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MedicalPlanUpdateDTO dto)
        {
            await _service.UpdateAsync(id, dto);
            return Ok(new { message = "Đã cập nhật kế hoạch." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return Ok(new { message = "Đã xoá kế hoạch." });
        }
    }

}
