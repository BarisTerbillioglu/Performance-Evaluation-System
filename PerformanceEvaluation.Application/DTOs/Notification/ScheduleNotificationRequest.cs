namespace PerformanceEvaluation.Application.DTOs.Notification
{
    public class ScheduleNotificationRequest
    {
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime ScheduledTime { get; set; }
    }
}