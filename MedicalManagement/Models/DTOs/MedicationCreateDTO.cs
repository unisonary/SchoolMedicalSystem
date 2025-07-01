using Newtonsoft.Json;
using NPOI.SS.Util;

namespace MedicalManagement.Models.DTOs
{
    public class MedicationCreateDTO
    {
        public int StudentId { get; set; }
        public string MedicationName { get; set; }
        public string Dosage { get; set; }
        public string Frequency { get; set; }
        public string Instructions { get; set; }

        [JsonConverter(typeof(DateFormatConverter), "yyyy-MM-dd")]
        public DateTime StartDate { get; set; }

        [JsonConverter(typeof(DateFormatConverter), "yyyy-MM-dd")]
        public DateTime EndDate { get; set; }
    }


}
