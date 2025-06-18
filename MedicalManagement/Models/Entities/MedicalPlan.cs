using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MedicalManagement.Models.Entities
{
    [Table("Medical_Plan")]
    public class MedicalPlan
    {
        [Key]
        [Column("plan_id")]
        public int PlanId { get; set; }

        [Column("manager_id")]
        public int ManagerId { get; set; }

        [Column("plan_type")]
        public string PlanType { get; set; }

        [Column("plan_name")]
        public string PlanName { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Column("target_grade")]
        public string TargetGrade { get; set; }

        [Column("status")]
        public string Status { get; set; }

        [Column("created_date")]
        public DateTime CreatedDate { get; set; }
    }
}
