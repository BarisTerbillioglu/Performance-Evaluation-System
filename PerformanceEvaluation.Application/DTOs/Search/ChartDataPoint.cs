namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class ChartDataPoint
    {
        public string Label { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public DateTime Date { get; set; }
        public string Category { get; set; } = string.Empty;
    }
}