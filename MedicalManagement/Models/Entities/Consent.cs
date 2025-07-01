using System.ComponentModel.DataAnnotations.Schema;
using MedicalManagement.Models.Entities;

[Table("Consent")]
public class Consent
{
    [Column("consent_id")]
    public int ConsentId { get; set; }

    [Column("student_id")]
    public int StudentId { get; set; }

    [Column("parent_id")]
    public int ParentId { get; set; }

    [Column("consent_type")]
    public string ConsentType { get; set; }

    [Column("reference_id")]
    public int ReferenceId { get; set; }

    [Column("consent_status")]
    public string ConsentStatus { get; set; }

    [Column("consent_date")]
    public DateTime? ConsentDate { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("requested_date")]
    public DateTime RequestedDate { get; set; }

    public Student Student { get; set; }
}
