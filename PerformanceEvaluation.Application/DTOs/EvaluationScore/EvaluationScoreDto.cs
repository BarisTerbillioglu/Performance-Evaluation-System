namespace PerformanceEvaluation.Application.DTOs.EvaluationScore
{
    public class EvaluationScoreDto
    {
        public int Id { get; set; }
        public int EvaluationId { get; set; }
        public int CriteriaId { get; set; }
        public string CriteriaName { get; set; } = string.Empty;
        public int Score { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}