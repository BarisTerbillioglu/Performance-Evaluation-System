namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class AdvancedAnalyticsDto
    {
        public Dictionary<string, object> Metrics { get; set; } = new();
        public List<ChartDataPoint> ChartData { get; set; } = new();
        public Dictionary<string, decimal> Comparisons { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
        public string Period { get; set; } = string.Empty;
    }

}