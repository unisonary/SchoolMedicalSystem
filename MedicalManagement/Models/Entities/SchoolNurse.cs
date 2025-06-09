using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

[Table("School_Nurse")]
public class SchoolNurse
{
    [Key]
    [Column("nurse_id")]
    public int NurseId { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("email")]
    public string Email { get; set; }

    [Column("specialization")]
    public string Specialization { get; set; }
}
