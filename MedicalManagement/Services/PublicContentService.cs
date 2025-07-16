using MedicalManagement.Data;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class PublicContentService : IPublicContentService
    {
        private readonly AppDbContext _context;

        public PublicContentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<HealthDocument>> GetLatestDocumentsAsync()
        {
            return await _context.HealthDocuments
                .Where(d => !d.IsDeleted)
                .OrderByDescending(d => d.DocumentId)
                .Take(3)
                .ToListAsync();
        }

        public async Task<List<BlogPost>> GetLatestBlogsAsync()
        {
            return await _context.BlogPosts
                .Where(b => !b.IsDeleted)
                .OrderByDescending(b => b.BlogId)
                .Take(3)
                .ToListAsync();
        }

        public async Task<List<HealthDocument>> SearchDocumentsAsync(string title)
        {
            return await _context.HealthDocuments
                .Where(d => !d.IsDeleted && d.Title.Trim().ToLower().Contains(title.Trim().ToLower()))
                .ToListAsync();
        }

        public async Task<List<BlogPost>> SearchBlogsAsync(string title)
        {
            return await _context.BlogPosts
                .Where(b => !b.IsDeleted && b.Title.Trim().ToLower().Contains(title.Trim().ToLower()))
                .ToListAsync();
        }

        public async Task<HealthDocument?> GetDocumentByIdAsync(int id)
        {
            return await _context.HealthDocuments
                .Where(d => !d.IsDeleted && d.DocumentId == id)
                .FirstOrDefaultAsync();
        }

        public async Task<BlogPost?> GetBlogByIdAsync(int id)
        {
            return await _context.BlogPosts
                .Where(b => !b.IsDeleted && b.BlogId == id)
                .FirstOrDefaultAsync();
        }

        public async Task<List<HealthDocument>> GetAllDocumentsAsync()
        {
            return await _context.HealthDocuments
                .Where(d => !d.IsDeleted)
                .OrderByDescending(d => d.DocumentId)
                .ToListAsync();
        }

        public async Task<List<BlogPost>> GetAllBlogsAsync()
        {
            return await _context.BlogPosts
                .Where(b => !b.IsDeleted)
                .OrderByDescending(b => b.BlogId)
                .ToListAsync();
        }

    }

}
