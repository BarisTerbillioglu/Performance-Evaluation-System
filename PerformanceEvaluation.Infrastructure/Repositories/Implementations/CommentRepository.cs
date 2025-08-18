using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Implementation
{
    public class CommentRepository : BaseRepository<Comment>, ICommentRepository
    {
        public CommentRepository(ApplicationDbContext context, ILogger<CommentRepository> logger) 
            : base(context, logger) { }

        public async Task<bool> CanUserAccessCommentAsync(int evaluationScoreId, ClaimsPrincipal user)
        {
            var requestingUserId = GetUserId(user);
            if (requestingUserId == 0) return false;

            if (IsAdmin(user)) return true;

            var evaluationInfo = await _context.EvaluationScores
                .Where(es => es.ID == evaluationScoreId)
                .Include(es => es.Evaluation)
                .Select(es => new { es.Evaluation.EvaluatorID, es.Evaluation.EmployeeID })
                .FirstOrDefaultAsync();

            if (evaluationInfo == null) return false;

            if (IsEvaluator(user))
            {
                return evaluationInfo.EvaluatorID == requestingUserId;
            }

            if (IsEmployee(user))
            {
                return evaluationInfo.EmployeeID == requestingUserId;
            }

            return false;
        }

        public async Task<IEnumerable<Comment>> GetByEvaluationScoreIdAsync(int evaluationScoreId)
        {
            return await _dbSet
                .Where(c => c.ScoreID == evaluationScoreId && c.IsActive)
                .OrderBy(c => c.CreatedDate)
                .ToListAsync();
        }

        public async Task<Comment> AddCommentAsync(int evaluationScoreId, string description, ClaimsPrincipal user)
        {
            if (!await CanUserAccessCommentAsync(evaluationScoreId, user))
            {
                throw new UnauthorizedAccessException("Cannot access this evaluation score");
            }

            if (string.IsNullOrWhiteSpace(description))
            {
                throw new ArgumentException("Comment description cannot be empty");
            }

            var comment = new Comment
            {
                ScoreID = evaluationScoreId,
                Description = description.Trim(),
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            await _dbSet.AddAsync(comment);
            await _context.SaveChangesAsync();

            return comment;
        }

        public async Task<Comment?> UpdateCommentAsync(int commentId, string description, ClaimsPrincipal user)
        {
            var comment = await _dbSet
                .Include(c => c.EvaluationScore)
                .FirstOrDefaultAsync(c => c.ID == commentId);

            if (comment == null) return null;

            if (!await CanUserAccessCommentAsync(comment.ScoreID, user))
            {
                throw new UnauthorizedAccessException("Cannot access this comment");
            }

            if (string.IsNullOrWhiteSpace(description))
            {
                throw new ArgumentException("Comment description cannot be empty");
            }

            comment.Description = description.Trim();
            comment.UpdatedDate = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<bool> DeleteCommentAsync(int commentId, ClaimsPrincipal user)
        {
            var comment = await _dbSet.FindAsync(commentId);
            if (comment == null) return false;

            if (!await CanUserAccessCommentAsync(comment.ScoreID, user))
            {
                return false;
            }

            comment.IsActive = false;
            comment.UpdatedDate = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetCommentCountByEvaluationAsync(int evaluationId)
        {
            return await _context.EvaluationScores
                .Where(es => es.EvaluationID == evaluationId)
                .SelectMany(es => es.Comments)
                .Where(c => c.IsActive)
                .CountAsync();
        }

        /// <summary>
        /// Gets all comments for an entire evaluation (for summary/export)
        /// </summary>
        public async Task<IEnumerable<Comment>> GetByEvaluationIdAsync(int evaluationId)
        {
            return await _context.EvaluationScores
                .Where(es => es.EvaluationID == evaluationId)
                .SelectMany(es => es.Comments)
                .Where(c => c.IsActive)
                .Include(c => c.EvaluationScore)
                    .ThenInclude(es => es.Criteria)
                .OrderBy(c => c.EvaluationScore.Criteria.Name)
                    .ThenBy(c => c.CreatedDate)
                .ToListAsync();
        }
    }
}