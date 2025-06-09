using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace MedicalManagement.Helpers
{
    public class EmailService
    {
        private readonly SmtpSettings _settings;

        public EmailService(IOptions<SmtpSettings> settings)
        {
            _settings = settings.Value;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var message = new MailMessage();
            message.From = new MailAddress(_settings.Username);
            message.To.Add(toEmail);
            message.Subject = subject;
            message.Body = body;
            message.IsBodyHtml = false;

            using (var client = new SmtpClient(_settings.Host, _settings.Port))
            {
                client.EnableSsl = _settings.EnableSsl;
                client.Credentials = new NetworkCredential(_settings.Username, _settings.Password);
                await client.SendMailAsync(message);
            }
        }
    }
}