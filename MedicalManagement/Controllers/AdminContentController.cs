using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
///This class is for managing contents
namespace MedicalManagement.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/admin")]
    [ApiController]
    public class AdminContentController : ControllerBase
    {
        private readonly IContentService _contentService;

        public AdminContentController(IContentService contentService)
        {
            _contentService = contentService;
        }

        // Health Documents
        [HttpGet("documents")]
        public async Task<IActionResult> GetDocuments()
        {
            var list = await _contentService.GetDocumentsAsync();
            return Ok(list);
        }

        [HttpPost("documents")]
        public async Task<IActionResult> AddDocument([FromBody] HealthDocumentDTO dto)
        {
            await _contentService.AddDocumentAsync(dto);
            return Ok("Tài liệu đã được thêm");
        }

        [HttpPut("documents/{id}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] HealthDocumentDTO dto)
        {
            var result = await _contentService.UpdateDocumentAsync(id, dto);
            return result ? Ok("Cập nhật thành công") : NotFound("Không tìm thấy tài liệu");
        }

        [HttpDelete("documents/{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var result = await _contentService.DeleteDocumentAsync(id);
            return result ? Ok("Đã xoá tài liệu") : NotFound("Không tìm thấy tài liệu");
        }

        // Blog Posts
        [HttpGet("blogs")]
        public async Task<IActionResult> GetBlogs()
        {
            var list = await _contentService.GetBlogsAsync();
            return Ok(list);
        }

        [HttpPost("blogs")]
        public async Task<IActionResult> AddBlog([FromBody] BlogPostDTO dto)
        {
            await _contentService.AddBlogAsync(dto);
            return Ok("Bài viết đã được thêm");
        }

        [HttpPut("blogs/{id}")]
        public async Task<IActionResult> UpdateBlog(int id, [FromBody] BlogPostDTO dto)
        {
            var result = await _contentService.UpdateBlogAsync(id, dto);
            return result ? Ok("Cập nhật bài viết") : NotFound("Không tìm thấy bài viết");
        }

        [HttpDelete("blogs/{id}")]
        public async Task<IActionResult> DeleteBlog(int id)
        {
            var result = await _contentService.DeleteBlogAsync(id);
            return result ? Ok("Đã xoá bài viết") : NotFound("Không tìm thấy bài viết");
        }
    }
}
