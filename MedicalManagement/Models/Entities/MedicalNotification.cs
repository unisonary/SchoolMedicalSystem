using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedicalManagement.Models.Entities
{
    [Table("Medical_Notification")]
    public class MedicalNotification
    {
        [Key]
        [Column("notification_id")]
        public int NotificationId { get; set; }

        [Column("sender_id")]
        public int SenderId { get; set; }

        [Column("recipient_type")]
        public string RecipientType { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("title")]
        public string Title { get; set; }

        [Column("content")]
        public string Content { get; set; }

        [Column("notification_type")]
        public string NotificationType { get; set; }

        [Column("date")]
        public DateTime Date { get; set; }

        [Column("is_read")]
        public bool IsRead { get; set; }

        [Column("priority")]
        public string Priority { get; set; }
    }
}
