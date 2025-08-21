namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class InsightDto
    {
        public string Type { get; set; } = string.Empty; // Performance, Trend, Anomaly
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Impact { get; set; } = string.Empty; // High, Medium, Low
        public Dictionary<string, object> Data { get; set; } = new();
    }
}