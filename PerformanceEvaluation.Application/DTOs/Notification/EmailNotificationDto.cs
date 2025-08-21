namespace PerformanceEvaluation.Application.DTOs.Notification
{
    public class EmailNotificationDto
    {
        public string ToEmail { get; set; } = string.Empty;
        public string ToName { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public bool IsHtml { get; set; } = true;
        public string? TemplateName { get; set; }
        public Dictionary<string, object> TemplateData { get; set; } = new();
    }
}