using System.Security.Claims;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Interfaces
{
    public interface IEvaluationScoreRepository : IBaseRepository<EvaluationScore>
    {
        Task<EvaluationScore?> GetByEvaluationAndCriteriaAsync(int evaluationId, int criteriaId);
        Task<IEnumerable<EvaluationScore>> GetByEvaluationIdAsync(int evaluationId);
        Task<EvaluationScore> AddOrUpdateScoreAsync(int evaluationId, int criteriaId, int score, ClaimsPrincipal user);
        Task<bool> DeleteScoreAsync(int evaluationId, int criteriaId, ClaimsPrincipal user);
        Task<bool> HasAllRequiredScoresAsync(int evaluationId);
        Task<decimal> CalculateTotalScoreAsync(int evaluationId);
        Task<bool> CanUserAccessScoreAsync(int evaluationId, ClaimsPrincipal user);
    }
}