namespace MedicalManagement.Models.DTOs
{
    public class InventoryReadDTO
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string ItemType { get; set; }
        public int Quantity { get; set; }
        public string Unit { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int MinimumStockLevel { get; set; }
    }
}
