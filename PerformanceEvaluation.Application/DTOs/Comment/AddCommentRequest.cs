namespace PerformanceEvaluation.Application.DTOs.Comment
{
    public class AddCommentRequest
    {
        public int EvaluationId { get; set; }
        public int CriteriaId { get; set; }
        public string Comment { get; set; } = string.Empty;
    }
}