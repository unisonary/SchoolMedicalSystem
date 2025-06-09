using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalManagement.Models.Entities
{
    [Table("Health_Checkup")]
    public class HealthCheckup
    {
        [Key]
        [Column("checkup_id")]
        public int CheckupId { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("plan_id")]
        public int PlanId { get; set; }

        [Column("checkup_type")]
        public string CheckupType { get; set; }

        [Column("result")]
        public string Result { get; set; }

        [Column("abnormal_findings")]
        public string AbnormalFindings { get; set; }

        [Column("recommendations")]
        public string Recommendations { get; set; }

        [Column("date")]
        public DateTime Date { get; set; }

        [Column("nurse_id")]
        public int NurseId { get; set; }

        [ForeignKey("NurseId")]
        public SchoolNurse Nurse { get; set; }

        [Column("follow_up_required")]
        public bool FollowUpRequired { get; set; }
    }
}
