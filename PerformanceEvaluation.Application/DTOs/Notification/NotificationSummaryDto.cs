namespace PerformanceEvaluation.Application.DTOs.Notification
{
    public class NotificationSummaryDto
    {
        public int TotalNotifications { get; set; }
        public int UnreadCount { get; set; }
        public int TodayCount { get; set; }
        public int WeekCount { get; set; }
        public List<NotificationDto> RecentNotifications { get; set; } = new();
    }
}