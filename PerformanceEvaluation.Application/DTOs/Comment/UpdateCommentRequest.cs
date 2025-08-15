namespace PerformanceEvaluation.Application.DTOs.Comment
{
    public class UpdateCommentRequest
    {
        public int CommentId { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}