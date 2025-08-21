using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.Application.DTOs.Export
{
    public class ComprehensiveReportRequest
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<int> DepartmentIds { get; set; } = new();
        public ReportType ReportType { get; set; }
        public bool IncludeExecutiveSummary { get; set; } = true;
        public bool IncludeDetailedAnalysis { get; set; } = true;
        public bool IncludeRecommendations { get; set; } = true;
    }
}