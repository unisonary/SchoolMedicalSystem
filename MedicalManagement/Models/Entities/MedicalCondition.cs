using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalManagement.Models.Entities
{
    [Table("Medical_Condition")]
    public class MedicalCondition
    {
        [Key]
        [Column("condition_id")]
        public int ConditionId { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("condition_type")]
        public string ConditionType { get; set; } // Allergy, Chronic_Disease,...

        [Column("condition_name")]
        public string ConditionName { get; set; }

        [Column("severity")]
        public string Severity { get; set; } // Mild, Moderate, Severe

        [Column("description")]
        public string Description { get; set; }

        [Column("reported_by_parent")]
        public bool ReportedByParent { get; set; } = true;

        [Column("date_reported")]
        public DateTime DateReported { get; set; } = DateTime.UtcNow;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;
    }
}
