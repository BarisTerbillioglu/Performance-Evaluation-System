using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class EvaluationSearchDto
    {
        public int Id { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string EvaluatorName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public EvaluationStatus Status { get; set; }
        public decimal? TotalScore { get; set; }
        public bool HasComments { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}