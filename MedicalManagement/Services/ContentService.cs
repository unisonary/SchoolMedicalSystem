using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Models.Entities;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MedicalManagement.Services
{
    public class ContentService : IContentService
    {
        private readonly AppDbContext _context;

        public ContentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<HealthDocument>> GetDocumentsAsync()
        {
            return await _context.HealthDocuments
                .Where(d => !d.IsDeleted)
                .ToListAsync();
        }

        public async Task AddDocumentAsync(HealthDocumentDTO dto)
        {
            _context.HealthDocuments.Add(new HealthDocument
            {
                Title = dto.Title,
                Content = dto.Content
            });
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateDocumentAsync(int id, HealthDocumentDTO dto)
        {
            var doc = await _context.HealthDocuments.FindAsync(id);
            if (doc == null || doc.IsDeleted) return false;

            doc.Title = dto.Title;
            doc.Content = dto.Content;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteDocumentAsync(int id)
        {
            var doc = await _context.HealthDocuments.FindAsync(id);
            if (doc == null || doc.IsDeleted) return false;

            doc.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<BlogPost>> GetBlogsAsync()
        {
            return await _context.BlogPosts
                .Where(b => !b.IsDeleted)
                .ToListAsync();
        }

        public async Task AddBlogAsync(BlogPostDTO dto)
        {
            _context.BlogPosts.Add(new BlogPost
            {
                Title = dto.Title,
                Content = dto.Content
            });
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateBlogAsync(int id, BlogPostDTO dto)
        {
            var blog = await _context.BlogPosts.FindAsync(id);
            if (blog == null || blog.IsDeleted) return false;

            blog.Title = dto.Title;
            blog.Content = dto.Content;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteBlogAsync(int id)
        {
            var blog = await _context.BlogPosts.FindAsync(id);
            if (blog == null || blog.IsDeleted) return false;

            blog.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}