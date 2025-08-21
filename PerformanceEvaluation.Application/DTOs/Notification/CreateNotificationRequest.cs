using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Notification
{
    public class CreateNotificationRequest
    {
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = "Info";
        
        [MaxLength(500)]
        public string? ActionUrl { get; set; }
        
        public Dictionary<string, object> Metadata { get; set; } = new();
    }
}