namespace PerformanceEvaluation.Application.DTOs.Comment
{
    public class CommentDto
    {
        public int Id { get; set; }
        public int ScoreId { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsActive { get; set; }
    }
}