using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalManagement.Models.Entities
{
    [Table("Inventory")]
    public class Inventory
    {
        [Key]
        [Column("item_id")]
        public int ItemId { get; set; }

        [Column("item_name")]
        public string ItemName { get; set; }

        [Column("item_type")]
        public string ItemType { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; }

        [Column("unit")]
        public string Unit { get; set; }

        [Column("expiry_date")]
        public DateTime? ExpiryDate { get; set; }

        [Column("minimum_stock_level")]
        public int MinimumStockLevel { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;



    }
}
