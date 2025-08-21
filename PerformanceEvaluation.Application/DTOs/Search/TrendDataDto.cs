namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class TrendDataDto
    {
        public string Label { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Value { get; set; }
        public string Category { get; set; } = string.Empty;
    }
}