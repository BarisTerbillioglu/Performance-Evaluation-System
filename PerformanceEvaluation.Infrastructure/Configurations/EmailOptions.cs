using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Infrastructure.Configuration
{
    public class EmailOptions
    {
        [Required]
        public string SmtpHost { get; set; } = string.Empty;
        
        [Range(1, 65535)]
        public int SmtpPort { get; set; } = 587;
        
        public bool EnableSsl { get; set; } = true;
        
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string FromEmail { get; set; } = string.Empty;
        
        [Required]
        public string FromName { get; set; } = string.Empty;
    }
}