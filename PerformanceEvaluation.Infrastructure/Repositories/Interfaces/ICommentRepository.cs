using System.Security.Claims;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Interfaces
{
    public interface ICommentRepository : IBaseRepository<Comment>
    {
        Task<IEnumerable<Comment>> GetByEvaluationScoreIdAsync(int evaluationScoreId);
        Task<IEnumerable<Comment>> GetByEvaluationIdAsync(int evaluationId);
        Task<Comment> AddCommentAsync(int evaluationScoreId, string description, ClaimsPrincipal user);
        Task<Comment?> UpdateCommentAsync(int commentId, string description, ClaimsPrincipal user);
        Task<bool> DeleteCommentAsync(int commentId, ClaimsPrincipal user);
        Task<bool> CanUserAccessCommentAsync(int evaluationScoreId, ClaimsPrincipal user);
        Task<int> GetCommentCountByEvaluationAsync(int evaluationId);
    }
}
