using MedicalManagement.Models.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("Health_Checkup")]
public class HealthCheckup
{
    [Key]
    [Column("checkup_id")]
    public int CheckupId { get; set; }

    [Column("student_id")]
    public int StudentId { get; set; }

    [ForeignKey("StudentId")]
    public Student Student { get; set; }

    [Column("plan_id")]
    public int PlanId { get; set; }

    [ForeignKey("PlanId")]
    public MedicalPlan Plan { get; set; }

    [Column("checkup_type")]
    public string? CheckupType { get; set; }

    [Column("result")]
    public string? Result { get; set; }

    [Column("abnormal_findings")]
    public string? AbnormalFindings { get; set; }

    [Column("recommendations")]
    public string? Recommendations { get; set; }

    [Column("date")]
    public DateTime Date { get; set; }

    [Column("nurse_id")]
    public int NurseId { get; set; }

    [ForeignKey("NurseId")]
    public SchoolNurse Nurse { get; set; }

    [Column("follow_up_required")]
    public bool FollowUpRequired { get; set; }

    // 💡 Các thuộc tính bổ sung cho khám sức khỏe chi tiết
    [Column("weight_kg")]
    public double? WeightKg { get; set; }

    [Column("height_cm")]
    public double? HeightCm { get; set; }

    [Column("vision")]
    public string? Vision { get; set; }

    [Column("dental_health")]
    public string? DentalHealth { get; set; }

    [Column("cardiovascular_rate")]
    public int? CardiovascularRate { get; set; }
}
