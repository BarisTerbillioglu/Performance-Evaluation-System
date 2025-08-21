namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class AdvancedAnalyticsDto
    {
        public Dictionary<string, decimal> Metrics { get; set; } = new();
        public List<TrendDataDto> Trends { get; set; } = new();
        public List<ComparisonDto> Comparisons { get; set; } = new();
        public List<InsightDto> Insights { get; set; } = new();
        public Dictionary<string, List<ChartDataDto>> Charts { get; set; } = new();
        public List<RecommendationDto> Recommendations { get; set; } = new();
    }

}