﻿using Microsoft.EntityFrameworkCore;
using MedicalManagement.Models.Entities;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using MedicalManagement.Models.Entities;

namespace MedicalManagement.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<UserAccount> UserAccounts { get; set; }
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
        public DbSet<MedicalCondition> MedicalConditions { get; set; }
        public DbSet<Medication> Medications { get; set; }
        public DbSet<Consent> Consents { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Inventory> Inventory { get; set; }
        public DbSet<SupplyLog> SupplyLogs { get; set; }
        public DbSet<MedicalPlan> MedicalPlans { get; set; }
        public DbSet<HealthDocument> HealthDocuments { get; set; }
        public DbSet<BlogPost> BlogPosts { get; set; }




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

            modelBuilder.Entity<Student>()
                .HasOne(s => s.Parent)
                .WithMany(p => p.Students)
                .HasForeignKey(s => s.ParentId);
        }
    }
}
