using PerformanceEvaluation.Application.DTOs.Criteria;

namespace PerformanceEvaluation.Application.DTOs.Evaluation
{
    public class EvaluationFormDto
    {
        public int EvaluationId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string EvaluatorName { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal TotalScore { get; set; }
        public string? GeneralComments { get; set; }
        public List<CriteriaWithScoreDto> CriteriaWithScores { get; set; } = new();
    }
}