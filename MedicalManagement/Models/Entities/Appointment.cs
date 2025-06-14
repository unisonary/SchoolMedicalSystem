using System;
namespace MedicalManagement.Models.Entities
{
    public class Appointment
    {
        public int AppointmentId { get; set; }

        // Foreign keys
        public int StudentId { get; set; }
        public int ParentId { get; set; }
        public int? NurseId { get; set; }

        // Data fields
        public DateTime ScheduledDate { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; } = "Pending"; // 'Pending', 'Confirmed', 'Cancelled'

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}

