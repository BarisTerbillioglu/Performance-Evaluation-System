using PerformanceEvaluation.Application.DTOs.Comment;
using PerformanceEvaluation.Application.DTOs.EvaluationScore;

namespace PerformanceEvaluation.Application.DTOs.Evaluation
{
    public class UpdateEvaluationRequest
    {
        public int EvaluationId { get; set; }
        
        // Basic evaluation info
        public bool HasEvaluationUpdates { get; set; }
        public string? Period { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? GeneralComments { get; set; }
        
        // Score updates
        public List<UpdateScoreRequest>? ScoreUpdates { get; set; }
        
        // Comment updates
        public List<CommentUpdateDto>? CommentUpdates { get; set; }
    }
}