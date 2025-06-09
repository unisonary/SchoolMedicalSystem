using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

[Table("Manager")]
public class Manager
{
    [Key]
    [Column("manager_id")]
    public int ManagerId { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("email")]
    public string Email { get; set; }

    [Column("department")]
    public string Department { get; set; }

    [Column("position")]
    public string Position { get; set; }
}
