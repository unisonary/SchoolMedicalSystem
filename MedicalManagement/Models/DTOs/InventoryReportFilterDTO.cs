namespace MedicalManagement.Models.DTOs
{
    public class InventoryReportFilterDTO
    {
        public string? ItemType { get; set; }
        public DateTime? FromExpiryDate { get; set; }
        public DateTime? ToExpiryDate { get; set; }
    }
}
