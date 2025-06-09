using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

[Table("Parent")]
public class Parent
{
    [Key]
    [Column("parent_id")]
    public int ParentId { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("phone")]
    public string Phone { get; set; }

    [Column("email")]
    public string Email { get; set; }

    [Column("student_id")]
    public int StudentId { get; set; }
}
