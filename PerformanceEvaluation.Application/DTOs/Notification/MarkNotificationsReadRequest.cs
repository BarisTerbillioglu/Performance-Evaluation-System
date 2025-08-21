using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Notification
{
    public class MarkNotificationsReadRequest
    {
        [Required]
        public List<int> NotificationIds { get; set; } = new();
    }
}