using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalManagement.Models.Entities
{
    [Table("Health_Record")]
    public class HealthRecord
    {
        [Key]
        [Column("record_id")]
        public int RecordId { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("record_type")]
        public string RecordType { get; set; }

        [Column("date")]
        public DateTime Date { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("nurse_id")]
        public int NurseId { get; set; }

        [Column("severity")]
        public string Severity { get; set; }

        [Column("follow_up_required")]
        public bool FollowUpRequired { get; set; }

        [ForeignKey("NurseId")]
        public SchoolNurse Nurse { get; set; }
    }
}
