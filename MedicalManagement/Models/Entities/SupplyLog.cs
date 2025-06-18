using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MedicalManagement.Models.Entities
{
    [Table("Supply_Log")]
    public class SupplyLog
    {
        [Key]
        [Column("log_id")]
        public int LogId { get; set; }

        [Column("item_id")]
        public int ItemId { get; set; }

        [ForeignKey("ItemId")]
        public Inventory InventoryItem { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }  // Nurse ID

        [Column("action")]
        public string Action { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; }

        [Column("reason")]
        public string Reason { get; set; }

        [Column("date")]
        public DateTime Date { get; set; }

        [Column("reference_event_id")]
        public int ReferenceEventId { get; set; }

        [ForeignKey("ReferenceEventId")]
        public MedicalEvent MedicalEvent { get; set; }
    }

}
