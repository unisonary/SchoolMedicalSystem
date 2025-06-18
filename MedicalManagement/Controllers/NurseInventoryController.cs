using MedicalManagement.Models.DTOs;
using MedicalManagement.Services;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalManagement.Controllers
{
    [ApiController]
    [Route("api/nurse/inventory")]
    [Authorize(Roles = "Nurse")]
    public class NurseInventoryController : ControllerBase
    {
        private readonly IInventoryService _service;

        public NurseInventoryController(IInventoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] InventoryCreateDTO dto)
        {
            var id = await _service.CreateAsync(dto);
            return Ok(new { message = "Thêm thuốc/vật tư thành công.", itemId = id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] InventoryUpdateDTO dto)
        {
            await _service.UpdateAsync(id, dto);
            return Ok(new { message = "Cập nhật thành công." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _service.SoftDeleteAsync(id);
            return Ok(new { message = "Đã xóa vật tư (soft delete)." });
        }

    }

}
