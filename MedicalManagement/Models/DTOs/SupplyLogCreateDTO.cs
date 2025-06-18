namespace MedicalManagement.Models.DTOs
{
    public class SupplyLogCreateDTO
    {
        public int ItemId { get; set; }
        public int Quantity { get; set; }
        public string Reason { get; set; }
        public int ReferenceEventId { get; set; }
    }

}
