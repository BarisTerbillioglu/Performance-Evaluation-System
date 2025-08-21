namespace PerformanceEvaluation.Application.DTOs.Export
{
    public class PerformanceReportRequest
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? DepartmentId { get; set; }
        public int? TeamId { get; set; }
        public List<int> UserIds { get; set; } = new();
        public bool IncludeCharts { get; set; } = true;
        public bool IncludeComparisons { get; set; } = true;
    }
}