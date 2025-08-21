namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class PerformanceMetricsDto
    {
        public int TotalEvaluations { get; set; }
        public int CompletedEvaluations { get; set; }
        public decimal AverageScore { get; set; }
        public DateTime? LastEvaluationDate { get; set; }
        public string TrendDirection { get; set; } = string.Empty; // Improving, Declining, Stable
    }
}