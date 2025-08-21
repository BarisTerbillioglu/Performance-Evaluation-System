using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class EvaluationSearchRequest : BaseSearchRequest
    {
        public string? Query { get; set; }
        public List<int> EvaluatorIds { get; set; } = new();
        public List<int> EmployeeIds { get; set; } = new();
        public List<string> Statuses { get; set; } = new();
        public DateTime? StartDateFrom { get; set; }
        public DateTime? StartDateTo { get; set; }
        public DateTime? EndDateFrom { get; set; }
        public DateTime? EndDateTo { get; set; }
        public decimal? MinScore { get; set; }
        public decimal? MaxScore { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "createdDate";
        public string SortDirection { get; set; } = "desc";
    }
}