namespace PerformanceEvaluation.Application.DTOs.Notification
{
    public class NotificationPreferencesDto
    {
        public int UserId { get; set; }
        public bool EmailNotifications { get; set; } = true;
        public bool InAppNotifications { get; set; } = true;
        public bool EvaluationReminders { get; set; } = true;
        public bool StatusUpdates { get; set; } = true;
        public bool SystemAlerts { get; set; } = true;
        public string? PreferredTime { get; set; } // For scheduled notifications
        public string? TimeZone { get; set; }
    }
}