namespace PerformanceEvaluation.Application.DTOs.EvaluationScore
{
    public class UpdateScoreRequest
    {
        public int EvaluationId { get; set; }
        public int CriteriaId { get; set; }
        public int Score { get; set; }
    }
}