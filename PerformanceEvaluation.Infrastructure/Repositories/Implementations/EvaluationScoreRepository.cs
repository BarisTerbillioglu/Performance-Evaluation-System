using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;


namespace PerformanceEvaluation.Infrastructure.Repositories.Implementation
{
    public class EvaluationScoreRepository : BaseRepository<EvaluationScore>, IEvaluationScoreRepository
    {
        public EvaluationScoreRepository(ApplicationDbContext context, ILogger<EvaluationScoreRepository> logger) 
            : base(context, logger) { }

        public async Task<bool> CanUserAccessScoreAsync(int evaluationId, ClaimsPrincipal user)
        {
            var requestingUserId = GetUserId(user);
            if (requestingUserId == 0) return false;

            if (IsAdmin(user)) return true;

            var evaluation = await _context.Evaluations
                .Where(e => e.ID == evaluationId)
                .Select(e => new { e.EvaluatorID, e.EmployeeID })
                .FirstOrDefaultAsync();

            if (evaluation == null) return false;

            if (IsEvaluator(user))
            {
                return evaluation.EvaluatorID == requestingUserId;
            }

            if (IsEmployee(user))
            {
                return evaluation.EmployeeID == requestingUserId;
            }

            return false;
        }

        public async Task<EvaluationScore?> GetByEvaluationAndCriteriaAsync(int evaluationId, int criteriaId)
        {
            return await _dbSet
                .Include(es => es.Criteria)
                    .ThenInclude(c => c.CriteriaCategory)
                .FirstOrDefaultAsync(es => es.EvaluationID == evaluationId && 
                                          es.CriteriaID == criteriaId);
        }

        public async Task<IEnumerable<EvaluationScore>> GetByEvaluationIdAsync(int evaluationId)
        {
            return await _dbSet
                .Include(es => es.Criteria)
                    .ThenInclude(c => c.CriteriaCategory)
                .Where(es => es.EvaluationID == evaluationId)
                .OrderBy(es => es.Criteria.CriteriaCategory.Name)
                    .ThenBy(es => es.Criteria.Name)
                .ToListAsync();
        }

        public async Task<EvaluationScore> AddOrUpdateScoreAsync(
            int evaluationId, 
            int criteriaId, 
            int score, 
            ClaimsPrincipal user)
        {
            if (!await CanUserAccessScoreAsync(evaluationId, user))
            {
                throw new UnauthorizedAccessException("Cannot access this evaluation");
            }

            if (score < 1 || score > 5)
            {
                throw new ArgumentException("Score must be between 1 and 5");
            }

            var existingScore = await GetByEvaluationAndCriteriaAsync(evaluationId, criteriaId);

            if (existingScore != null)
            {
                existingScore.Score = score;
                existingScore.CreatedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
            else
            {
                existingScore = new EvaluationScore
                {
                    EvaluationID = evaluationId,
                    CriteriaID = criteriaId,
                    Score = score,
                    CreatedDate = DateTime.UtcNow
                };
                await _dbSet.AddAsync(existingScore);
                await _context.SaveChangesAsync();
            }

            return existingScore;
        }

        public async Task<bool> DeleteScoreAsync(int evaluationId, int criteriaId, ClaimsPrincipal user)
        {
            if (!await CanUserAccessScoreAsync(evaluationId, user))
            {
                return false;
            }

            var score = await GetByEvaluationAndCriteriaAsync(evaluationId, criteriaId);
            if (score != null)
            {
                _dbSet.Remove(score);
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }

        public async Task<bool> HasAllRequiredScoresAsync(int evaluationId)
        {
            var activeCriteriaCount = await _context.Criteria
                .Where(c => c.IsActive && c.CriteriaCategory.IsActive)
                .CountAsync();

            var scoredCriteriaCount = await _dbSet
                .Where(es => es.EvaluationID == evaluationId)
                .CountAsync();

            return activeCriteriaCount == scoredCriteriaCount;
        }

        public async Task<decimal> CalculateTotalScoreAsync(int evaluationId)
        {
            var scoreData = await _dbSet
                .Where(es => es.EvaluationID == evaluationId)
                .Include(es => es.Criteria)
                    .ThenInclude(c => c.CriteriaCategory)
                .Select(es => new
                {
                    Score = es.Score,
                    CategoryId = es.Criteria.CategoryID,
                    CategoryWeight = es.Criteria.CriteriaCategory.Weight
                })
                .ToListAsync();

            if (!scoreData.Any()) return 0;

            var categoryAverages = scoreData
                .GroupBy(s => s.CategoryId)
                .Select(g => new
                {
                    AverageScore = g.Average(s => s.Score),
                    Weight = g.First().CategoryWeight
                })
                .ToList();

            var totalWeightedScore = categoryAverages.Sum(ca => ca.AverageScore * (double)ca.Weight);
            var totalWeight = categoryAverages.Sum(ca => (double)ca.Weight);

            return totalWeight > 0 ? (decimal)(totalWeightedScore / totalWeight) : 0;
        }
    }
}