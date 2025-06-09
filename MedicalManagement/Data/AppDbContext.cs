using Microsoft.EntityFrameworkCore;
using MedicalManagement.Models.Entities;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace MedicalManagement.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<UserAccount> UserAccounts { get; set; }

        // ✅ THÊM các DbSet còn thiếu:
        public DbSet<Student> Students { get; set; }
        public DbSet<Parent> Parents { get; set; }
        public DbSet<Manager> Managers { get; set; }
        public DbSet<SchoolNurse> SchoolNurses { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<PasswordResetOtp> PasswordResetOtps { get; set; }
        public DbSet<HealthRecord> HealthRecords { get; set; }
        public DbSet<MedicalEvent> MedicalEvents { get; set; }
        public DbSet<Vaccination> Vaccinations { get; set; }
        public DbSet<HealthCheckup> HealthCheckups { get; set; }
        public DbSet<MedicalNotification> MedicalNotifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserAccount>(entity =>
            {
                entity.ToTable("User_Account");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Username).HasColumnName("username");
                entity.Property(e => e.Password).HasColumnName("password");
                entity.Property(e => e.Role).HasColumnName("role");
                entity.Property(e => e.ReferenceId).HasColumnName("reference_id");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.IsActive).HasColumnName("is_active");
                entity.Property(e => e.CreatedDate).HasColumnName("created_date");
            });

            // Bạn có thể thêm cấu hình cho các entity khác ở đây nếu muốn
        }
    }
}
