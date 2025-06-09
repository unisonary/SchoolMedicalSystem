using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalManagement.Models.Entities
{
    [Table("User_Account")]
    public class UserAccount
    {
        [Key]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("username")]
        [StringLength(50)]
        public string Username { get; set; }

        [Required]
        [Column("password")]
        [StringLength(255)]
        public string Password { get; set; }

        [Column("role")]
        [StringLength(50)]
        public string Role { get; set; }

        [Column("reference_id")]
        public int? ReferenceId { get; set; }

        [Column("created_by")]
        public int? CreatedBy { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_date")]
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Column("is_first_login")]
        public bool IsFirstLogin { get; set; } = true; // ✅ THÊM VÀO ĐÂY
    }
}
