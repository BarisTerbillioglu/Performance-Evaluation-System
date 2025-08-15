namespace PerformanceEvaluation.Application.DTOs.Evaluation
{
    public class EvaluationDto
    {
        public int Id { get; set; }
        public int EvaluatorId { get; set; }
        public int EmployeeId { get; set; }
        public string Period { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalScore { get; set; }
        public string? GeneralComments { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? CompletedDate { get; set; }
    }
}