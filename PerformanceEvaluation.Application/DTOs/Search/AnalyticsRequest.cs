namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class AnalyticsRequest
    {
       public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<int> DepartmentIds { get; set; } = new();
        public List<string> MetricTypes { get; set; } = new();
        public string GroupBy { get; set; } = "month";
        public bool IncludeComparisons { get; set; } = false;
    }
}