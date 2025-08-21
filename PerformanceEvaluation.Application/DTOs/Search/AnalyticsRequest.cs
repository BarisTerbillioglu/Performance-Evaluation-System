namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class AnalyticsRequest
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<int> DepartmentIds { get; set; } = new();
        public List<int> UserIds { get; set; } = new();
        public List<string> MetricTypes { get; set; } = new(); // Scores, Completion, Trends, etc.
        public string GroupBy { get; set; } = "Department"; // Department, Role, Period
        public bool IncludeComparisons { get; set; } = true;
        public bool IncludePredictions { get; set; } = false;
    }
}