namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class ComparisonDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal CurrentValue { get; set; }
        public decimal PreviousValue { get; set; }
        public decimal PercentageChange { get; set; }
        public string TrendDirection { get; set; } = string.Empty;
    }
}