using MedicalManagement.Services;
using MedicalManagement.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MedicalManagement.Controllers
{
    [Route("api/public")]
    [ApiController]
    public class PublicContentController : ControllerBase 
    {
        private readonly IPublicContentService _contentService;

        public PublicContentController(IPublicContentService contentService)
        {
            _contentService = contentService;
        }

        [HttpGet("documents/latest")]
        public async Task<IActionResult> GetLatestDocuments()
            => Ok(await _contentService.GetLatestDocumentsAsync());

        [HttpGet("blogs/latest")]
        public async Task<IActionResult> GetLatestBlogs()
            => Ok(await _contentService.GetLatestBlogsAsync());

        [HttpGet("documents/search")]
        public async Task<IActionResult> SearchDocuments([FromQuery] string title)
            => Ok(await _contentService.SearchDocumentsAsync(title));

        [HttpGet("blogs/search")]
        public async Task<IActionResult> SearchBlogs([FromQuery] string title)
            => Ok(await _contentService.SearchBlogsAsync(title));

        [HttpGet("documents/{id}")]
        public async Task<IActionResult> GetDocumentById(int id)
        {
            var document = await _contentService.GetDocumentByIdAsync(id);
            if (document == null) return NotFound();
            return Ok(document);
        }

        [HttpGet("blogs/{id}")]
        public async Task<IActionResult> GetBlogById(int id)
        {
            var blog = await _contentService.GetBlogByIdAsync(id);
            if (blog == null) return NotFound();
            return Ok(blog);
        }

        [HttpGet("documents/all")]
        public async Task<IActionResult> GetAllDocuments()
    => Ok(await _contentService.GetAllDocumentsAsync());

        [HttpGet("blogs/all")]
        public async Task<IActionResult> GetAllBlogs()
            => Ok(await _contentService.GetAllBlogsAsync());


    }
}
