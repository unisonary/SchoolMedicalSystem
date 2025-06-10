using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalManagement.Models.Entities
{
    [Table("Student")]
    public class Student
    {
        [Key]
        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("gender")]
        public string Gender { get; set; }

        [Column("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }

        [Column("class")]
        public string Class { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("parent_id")]
        public int ParentId { get; set; }

        public Parent Parent { get; set; }
    }
}
