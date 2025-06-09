using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalManagement.Models.Entities
{
    [Table("Vaccination")]
    public class Vaccination
    {
        [Key]
        [Column("vaccination_id")]
        public int VaccinationId { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("plan_id")]
        public int PlanId { get; set; }

        [Column("vaccine_name")]
        public string VaccineName { get; set; }

        [Column("batch_number")]
        public string BatchNumber { get; set; }

        [Column("date")]
        public DateTime Date { get; set; }

        [Column("nurse_id")]
        public int NurseId { get; set; }

        [Column("reaction")]
        public string Reaction { get; set; }

        [Column("next_dose_due")]
        public DateTime? NextDoseDue { get; set; }

        [ForeignKey("NurseId")]
        public SchoolNurse Nurse { get; set; }
    }
}
