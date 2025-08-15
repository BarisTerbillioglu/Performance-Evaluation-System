namespace PerformanceEvaluation.Application.DTOs.Evaluation
{
    public class EvaluationListDto
    {
        public int Id { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string EvaluatorName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal TotalScore { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? CompletedDate { get; set; }
    }
}