using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class EvaluationSearchRequest : BaseSearchRequest
    {
        public List<int> EmployeeIds { get; set; } = new();
        public List<int> EvaluatorIds { get; set; } = new();
        public List<int> DepartmentIds { get; set; } = new();
        public List<EvaluationStatus> Statuses { get; set; } = new();
        public DateTime? StartDateFrom { get; set; }
        public DateTime? StartDateTo { get; set; }
        public DateTime? EndDateFrom { get; set; }
        public DateTime? EndDateTo { get; set; }
        public string? Period { get; set; }
        public decimal? MinScore { get; set; }
        public decimal? MaxScore { get; set; }
        public bool? HasComments { get; set; }
        public List<int> CriteriaIds { get; set; } = new();
    }
}