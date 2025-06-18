using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalManagement.Models.Entities
{
    [Table("Medication")]
    public class Medication
    {
        [Key]
        [Column("medication_id")]
        public int MedicationId { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [ForeignKey("StudentId")]
        public Student Student { get; set; }

        [Column("medication_name")]
        public string MedicationName { get; set; }

        [Column("dosage")]
        public string Dosage { get; set; }

        [Column("frequency")]
        public string Frequency { get; set; }

        [Column("instructions")]
        public string Instructions { get; set; }

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("provided_by_parent")]
        public bool ProvidedByParent { get; set; } = true;

        [Column("nurse_id")]
        public int? NurseId { get; set; }

        [ForeignKey("NurseId")]
        public SchoolNurse Nurse { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Active";

        [Column("note")]
        public string? Note { get; set; }

    }
}
