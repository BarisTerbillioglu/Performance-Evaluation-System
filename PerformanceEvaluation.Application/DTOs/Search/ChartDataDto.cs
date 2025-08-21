namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class ChartDataDto
    {
        public string Label { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public string Color { get; set; } = string.Empty;
        public Dictionary<string, object> Metadata { get; set; } = new();
    }
}