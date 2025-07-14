using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace MedicalManagement.Models.Entities
{
    [Table("Parent")]
    public class Parent
    {
        [Key]
        [Column("parent_id")]
        public int ParentId { get; set; }

        [Required]
        [Column("name")]
        public string Name { get; set; }

        [Required]
        [Phone]
        [Column("phone")]
        public string Phone { get; set; }

        [Required]
        [EmailAddress]
        [Column("email")]
        public string Email { get; set; }

        public ICollection<Student> Students { get; set; }
    }

}
