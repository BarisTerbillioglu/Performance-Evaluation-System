namespace PerformanceEvaluation.Application.DTOs.Comment
{
    public class CommentUpdateDto
    {
        public int CommentId { get; set; } // 0 for new comment
        public int CriteriaId { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}