namespace MedicalManagement.Models.DTOs
{
    public class InventoryCreateDTO
    {
        public string ItemName { get; set; }
        public string ItemType { get; set; }
        public int Quantity { get; set; }
        public string Unit { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int MinimumStockLevel { get; set; }
    }
}
