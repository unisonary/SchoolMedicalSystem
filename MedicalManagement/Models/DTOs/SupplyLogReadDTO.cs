namespace MedicalManagement.Models.DTOs
{
    public class SupplyLogReadDTO
    {
        public int LogId { get; set; }
        public string ItemName { get; set; }
        public string NurseName { get; set; }
        public string Action { get; set; }
        public int Quantity { get; set; }
        public string Reason { get; set; }
        public DateTime Date { get; set; }
        public int ReferenceEventId { get; set; }
    }

}
