// PerformanceEvaluation.Core/Entities/Notification.cs
using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Core.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        
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
        public string Type { get; set; } = string.Empty; // Info, Warning, Success, Error
        
        [MaxLength(500)]
        public string? ActionUrl { get; set; }
        
        public bool IsRead { get; set; } = false;
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        public DateTime? ReadDate { get; set; }
        
        [MaxLength(2000)]
        public string? Metadata { get; set; } // JSON string for additional data
        
        // Navigation property
        public User User { get; set; } = null!;
    }
}