namespace PerformanceEvaluation.Application.DTOs.Notification
{
    public class TestNotificationRequest
    {
        public int UserId { get; set; }
        public string? Message { get; set; }
        public bool SendEmail { get; set; } = false;
        public string? Email { get; set; }
    }
}