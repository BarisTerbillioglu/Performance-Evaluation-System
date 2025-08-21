using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Notification
{
    public class SendNotificationRequest
    {
        [Required]
        public List<int> UserIds { get; set; } = new();
        
        [Required]
        [MaxLength(200)]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string Type { get; set; } = "Info";
        
        [MaxLength(500)]
        public string? ActionUrl { get; set; }
        
        public bool SendEmail { get; set; } = false;
        
        public Dictionary<string, object> Metadata { get; set; } = new();
    }
}