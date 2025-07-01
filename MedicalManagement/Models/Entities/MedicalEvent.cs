using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalManagement.Models.Entities
{
    [Table("Medical_Event")]
    public class MedicalEvent
    {
        [Key]
        [Column("event_id")]
        public int EventId { get; set; }

        [Column("nurse_id")]
        public int NurseId { get; set; }

        [ForeignKey("NurseId")]
        public SchoolNurse Nurse { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("event_type")]
        public string EventType { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("severity")]
        public string Severity { get; set; }

        [Column("treatment_given")]
        public string TreatmentGiven { get; set; }

        [Column("parent_notified")]
        public bool ParentNotified { get; set; }

        [Column("follow_up_required")]
        public bool FollowUpRequired { get; set; }

        [Column("date")]
        public DateTime Date { get; set; }

        [Column("location")]
        public string Location { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        public Student Student { get; set; }

        public SchoolNurse SchoolNurse { get; set; }
    }
}
