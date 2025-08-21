using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class EvaluationSearchDto
    {
       public int Id { get; set; }
        public string EvaluatorName { get; set; } = string.Empty;
        public string EmployeeName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal? TotalScore { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string Period { get; set; } = string.Empty;
    }
}