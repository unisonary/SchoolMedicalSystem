namespace MedicalManagement.Models.DTOs
{
    public class InventoryReportDTO
    {
        public string ItemName { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public int MinimumStockLevel { get; set; }
        public DateTime? ExpiryDate { get; set; } 
        public string AlertStatus { get; set; } = string.Empty;
    }

}
