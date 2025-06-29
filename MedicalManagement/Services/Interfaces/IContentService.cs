using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MedicalManagement.Services.Interfaces
{
    public interface IContentService
    {
        Task<List<HealthDocument>> GetDocumentsAsync();
        Task AddDocumentAsync(HealthDocumentDTO dto);
        Task<bool> UpdateDocumentAsync(int id, HealthDocumentDTO dto);
        Task<bool> DeleteDocumentAsync(int id);

        Task<List<BlogPost>> GetBlogsAsync();
        Task AddBlogAsync(BlogPostDTO dto);
        Task<bool> UpdateBlogAsync(int id, BlogPostDTO dto);
        Task<bool> DeleteBlogAsync(int id);
    }
}