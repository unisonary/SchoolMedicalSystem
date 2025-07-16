using MedicalManagement.Models.Entities;

namespace MedicalManagement.Services.Interfaces
{
    public interface IPublicContentService
    {
        Task<List<HealthDocument>> GetLatestDocumentsAsync();
        Task<List<BlogPost>> GetLatestBlogsAsync();
        Task<List<HealthDocument>> SearchDocumentsAsync(string title);
        Task<List<BlogPost>> SearchBlogsAsync(string title);
        Task<HealthDocument?> GetDocumentByIdAsync(int id);
        Task<BlogPost?> GetBlogByIdAsync(int id);
        Task<List<HealthDocument>> GetAllDocumentsAsync();
        Task<List<BlogPost>> GetAllBlogsAsync();
    }

}
