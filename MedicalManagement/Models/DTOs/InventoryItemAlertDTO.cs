namespace MedicalManagement.Models.DTOs
{
    public class InventoryItemAlertDTO
    {
        public int ItemId { get; set; }             // không cần nullable
        public string ItemName { get; set; } = "";  // thêm default empty string
        public string ItemType { get; set; } = "";
        public int Quantity { get; set; }
        public int MinimumStockLevel { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string AlertType { get; set; } = ""; // tránh null
    }


}
