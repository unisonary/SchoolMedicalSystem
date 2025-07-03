namespace MedicalManagement.Models.DTOs
{
    public class ConsentedStudentDTO
    {
        public int StudentId { get; set; }
        public string Name { get; set; }
        public string Class { get; set; }
        public int ParentId { get; set; }
    }

}
