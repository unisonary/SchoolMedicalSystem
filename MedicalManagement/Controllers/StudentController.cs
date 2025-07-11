using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MedicalManagement.Data;
using MedicalManagement.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Globalization;
using System.Text;

namespace MedicalManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Student,Admin,Manager, Nurse")]
    public class StudentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Student
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Student>>> GetAllStudents()
        {
            return await _context.Students.ToListAsync();
        }

        // GET: api/Student/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Student>> GetStudent(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound();
            }
            return student;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchStudentsByName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest(new { message = "Thiếu tên để tìm kiếm." });

            string normalizedInput = RemoveDiacritics(name.ToLower());

            var students = await _context.Students
                .Include(s => s.Parent)
                .ToListAsync(); // Lấy tất cả học sinh trước

            var result = students
                .Where(s => RemoveDiacritics(s.Name.ToLower()).Contains(normalizedInput))
                .Select(s => new
                {
                    studentId = s.StudentId,
                    name = s.Name,
                    className = s.Class,
                    parentName = s.Parent != null ? s.Parent.Name : "(Không rõ)",
                    parentPhone = s.Parent.Phone
                })
                .ToList();

            return Ok(result);
        }


        // Utility function: remove dấu tiếng Việt
        private string RemoveDiacritics(string text)
        {
            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }


        // POST: api/Student
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Student>> CreateStudent(Student student)
        {
            _context.Students.Add(student);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetStudent), new { id = student.StudentId }, student);
        }

        // PUT: api/Student/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStudent(int id, Student student)
        {
            if (id != student.StudentId)
                return BadRequest();

            _context.Entry(student).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StudentExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/Student/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
                return NotFound();

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool StudentExists(int id)
        {
            return _context.Students.Any(e => e.StudentId == id);
        }

        [HttpPost("{id}/upload-avatar")]
        public async Task<IActionResult> UploadAvatar(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Ảnh không hợp lệ");

            var student = await _context.Students.FindAsync(id);
            if (student == null) return NotFound("Không tìm thấy học sinh");

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            student.Avatar = ms.ToArray();

            await _context.SaveChangesAsync();
            return Ok(new { message = "Upload ảnh đại diện thành công." });
        }

        [HttpGet("{id}/avatar")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvatar(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null || student.Avatar == null)
                return NotFound();

            return File(student.Avatar, "image/jpeg"); 
        }

    }
}
