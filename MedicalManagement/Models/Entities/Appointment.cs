using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace MedicalManagement.Models.Entities
{
    [Table("Appointment")]
    public class Appointment
    {
        [Key]
        [Column("appointment_id")]
        public int AppointmentId { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [ForeignKey("StudentId")]
        public Student Student { get; set; }

        [Column("parent_id")]
        public int ParentId { get; set; }

        [ForeignKey("ParentId")]
        public Parent Parent { get; set; }

        [Column("nurse_id")]
        public int NurseId { get; set; }  

        [ForeignKey("NurseId")]
        public SchoolNurse Nurse { get; set; }

        [Column("appointment_date")]
        public DateTime AppointmentDate { get; set; }

        [Column("reason")]
        public string Reason { get; set; }

        [Column("status")]
        public string Status { get; set; } // e.g. "Pending", "Completed"

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_date")]
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}

