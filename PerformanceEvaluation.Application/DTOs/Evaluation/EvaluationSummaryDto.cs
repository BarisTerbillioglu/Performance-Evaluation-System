namespace PerformanceEvaluation.Application.DTOs.Evaluation
{
    public class EvaluationSummaryDto
    {
        public int EvaluationId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string EvaluatorName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public decimal TotalScore { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public int ScoreCount { get; set; }
        public int CommentCount { get; set; }
        public bool IsComplete { get; set; }
    }
}