using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Enums;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Implementation
{
    public class EvaluationRepository : BaseRepository<Evaluation>, IEvaluationRepository
    {
        public EvaluationRepository(ApplicationDbContext context, ILogger<EvaluationRepository> logger)
            : base(context, logger) { }

        public async Task<bool> CanAccessAsync(int id, ClaimsPrincipal user)
        {
            try
            {
                var requestingUserId = GetUserId(user);
                var evaluation = await _dbSet
                    .Where(e => e.ID == id)
                    .Select(e => new { e.EvaluatorID, e.EmployeeID })
                    .FirstOrDefaultAsync();

                if (evaluation == null)
                {
                    _logger.LogWarning("User {UserId} attempted to access non-existent evaluation {EvaluationId}",
                        requestingUserId, id);
                    return false;
                }
                if (IsAdmin(user))
                {
                    _logger.LogInformation("Admin user {RequestingUserId} is granted access to user data {TargetUserId}",
                        requestingUserId, id);
                    return true;
                }
                if (IsEvaluator(user))
                {
                    var evaluatorId = GetUserId(user);
                    var teamEvaluations = await GetTeamEvaluationsAsync(evaluatorId);
                    var canAccess = teamEvaluations.Contains(await GetByIdAsync(id));
                    if (canAccess)
                    {
                        _logger.LogInformation("Evaluator {EvaluatorId} granted access to team member {EmployeeId}",
                            evaluatorId, id);
                    }
                    else
                    {
                        _logger.LogWarning("Evaluator {EvaluatorId} denied access to non-team member {EmployeeId}",
                            evaluatorId, id);
                    }
                    return canAccess;
                }
                if (IsEmployee(user))
                {
                    var employeeId = GetUserId(user);
                    var myEvaluations = await GetMyPerformanceHistoryAsync(employeeId);
                    var canAccess = myEvaluations.Contains(await GetByIdAsync(id)) && await GetByIdAsync(id) != null;

                    if (canAccess)
                    {
                        _logger.LogInformation("Employee {EmployeeId} is granted access to own data", employeeId);
                    }
                    else
                    {
                        _logger.LogWarning("Employee {EmployeeId} is denied access to other user's data {TargetUserId}",
                            employeeId, id);
                    }

                    return canAccess;
                }
                _logger.LogWarning("User {RequestingUserId} with unrecognized role is denied access to user data {TargetUserId}",
                    requestingUserId, id);
                return false;
            }
            catch (Exception ex)
            {
                var requestingUserId = GetUserId(user);
                _logger.LogError(ex, "Error checking data access authorization. Requesting user: {RequestingUserId}, Target user: {TargetUserId}",
                    requestingUserId, id);
                return false;
            }
        }

        public async Task<bool> CanEvaluateEmployeeAsync(int evaluatorId, int employeeId)
        {
            return await _context.EvaluatorAssignments
                    .AnyAsync(ea => ea.EvaluatorID == evaluatorId &&
                                   ea.EmployeeID == employeeId &&
                                   ea.IsActive);
        }

        public async Task<IEnumerable<Evaluation>> GetAllAsync(ClaimsPrincipal user)
        {
            if (IsAdmin(user))
            {
                return await GetAllEvaluationsAsync();
            }
            else if (IsEvaluator(user))
            {
                var evaluatorId = GetUserId(user);
                return await GetTeamEvaluationsAsync(evaluatorId);
            }
            else if (IsEmployee(user))
            {
                var employeeId = GetUserId(user);
                return await GetMyPerformanceHistoryAsync(employeeId);
            }
            return new List<Evaluation>();
        }

        public async Task<IEnumerable<Evaluation>> GetAllEvaluationsAsync()
        {
            return await _dbSet
            .Include(e => e.Evaluator)
            .Include(e => e.Employee)
                .ThenInclude(emp => emp.Department)
            .Include(e => e.EvaluationScores)
                .ThenInclude(es => es.Criteria)
                    .ThenInclude(c => c.CriteriaCategory)
            .Include(e => e.EvaluationScores)
                .ThenInclude(es => es.Comments)
            .OrderByDescending(e => e.CreatedDate)
            .ToListAsync();
        }

        public async Task<Evaluation?> GetByIdAsync(int id, ClaimsPrincipal user)
        {
            var query = _dbSet
                .Include(e => e.Evaluator)
                .Include(e => e.Employee)
                    .ThenInclude(emp => emp.Department)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                        .ThenInclude(c => c.CriteriaCategory)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Comments)
                .Where(e => e.ID == id);

            if (IsAdmin(user))
            {
                return await query.FirstOrDefaultAsync();
            }
            if (IsEvaluator(user))
            {
                return await query.Where(e => e.EvaluatorID == GetUserId(user)).FirstOrDefaultAsync();
            }
            if (IsEmployee(user))
            {
                return await query.Where(e => e.EmployeeID == GetUserId(user)).FirstOrDefaultAsync();
            }
            return null;
        }


        public async Task<IEnumerable<Evaluation>> GetEvaluationsByDepartmentAsync(int departmentId)
        {
            return await _dbSet
                .Include(e => e.Evaluator)
                .Include(e => e.Employee)
                    .ThenInclude(emp => emp.Department)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                        .ThenInclude(c => c.CriteriaCategory)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Comments)
                .Where(e => e.Employee.DepartmentID == departmentId)
                .OrderByDescending(e => e.CreatedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Evaluation>> GetEvaluationsByPeriodAsync(string period, ClaimsPrincipal user)
        {
            var query = _dbSet
                .Include(e => e.Evaluator)
                .Include(e => e.Employee)
                    .ThenInclude(emp => emp.Department)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                            .ThenInclude(c => c.CriteriaCategory)
                    .Include(e => e.EvaluationScores)
                        .ThenInclude(es => es.Comments)
                .Where(e => e.Period == period);

            if (IsEvaluator(user))
            {
                var evaluatorId = GetUserId(user);
                query = query.Where(e => e.EvaluatorID == evaluatorId);
            }
            else if (IsEmployee(user))
            {
                var employeeId = GetUserId(user);
                query = query.Where(e => e.EmployeeID == employeeId);
            }

            return await query.OrderByDescending(e => e.CreatedDate).ToListAsync();
        }

        public async Task<IEnumerable<Evaluation>> GetEvaluationsByStatusAsync(EvaluationStatus status, ClaimsPrincipal user)
        {
            var statusString = status.ToString();
            var query = _dbSet
                .Include(e => e.Evaluator)
                .Include(e => e.Employee)
                    .ThenInclude(emp => emp.Department)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                            .ThenInclude(c => c.CriteriaCategory)
                    .Include(e => e.EvaluationScores)
                        .ThenInclude(es => es.Comments)
                .Where(e => e.Status == statusString);

            if (IsEvaluator(user))
            {
                var evaluatorId = GetUserId(user);
                query = query.Where(e => e.EvaluatorID == evaluatorId);
            }
            else if (IsEmployee(user))
            {
                var employeeId = GetUserId(user);
                query = query.Where(e => e.EmployeeID == employeeId);
            }

            return await query.OrderByDescending(e => e.CreatedDate).ToListAsync();
        }

        public async Task<Evaluation?> GetMyEvaluationDetailsAsync(int evaluationId, int employeeId)
        {
            return await _dbSet
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                        .ThenInclude(c => c.CriteriaCategory)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Comments)
                .Include(e => e.Evaluator)
                .Include(e => e.Employee)
                    .ThenInclude(em => em.Department)
                .FirstOrDefaultAsync(e => e.ID == evaluationId && e.EmployeeID == employeeId);
        }

        public async Task<IEnumerable<Evaluation>> GetMyEvaluationsAsync(int evaluatorId)
        {
            return await _dbSet
                .Include(e => e.Employee)
                    .ThenInclude(emp => emp.Department)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                        .ThenInclude(c => c.CriteriaCategory)
                .Include(e => e.TotalScore)
                .Where(e => e.EvaluatorID == evaluatorId)
                .OrderByDescending(e => e.CreatedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Evaluation>> GetMyPerformanceHistoryAsync(int employeeId)
        {
            return await _dbSet
                .Include(e => e.Evaluator)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                        .ThenInclude(c => c.CriteriaCategory)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Comments)
                .Where(e => e.EmployeeID == employeeId)
                .OrderByDescending(e => e.CreatedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Evaluation>> GetTeamEvaluationsAsync(int evaluatorId)
        {
            var TeamMemberIds = await _context.EvaluatorAssignments
                    .Where(ea => ea.EvaluatorID == evaluatorId && ea.IsActive)
                    .Select(ea => ea.EmployeeID)
                    .Distinct()
                    .ToListAsync();

            return await _dbSet
                .Include(e => e.Evaluator)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                        .ThenInclude(c => c.CriteriaCategory)
                .Include(e => e.Employee)
                    .ThenInclude(em => em.Department)
                .Where(e => TeamMemberIds.Contains(e.EmployeeID) || e.EvaluatorID == evaluatorId)
                .OrderByDescending(e => e.CreatedDate)
                .ToListAsync();
        }

        public async Task<bool> UpdateEvaluationStatusAsync(int evaluationId, EvaluationStatus status, ClaimsPrincipal user)
        {
            if (!await CanAccessAsync(evaluationId, user))
            {
                _logger.LogWarning("User {UserId} denied status update for evaluation {EvaluationId} - no access",
                    GetUserId(user), evaluationId);
                return false;
            }

            var evaluation = await _dbSet.FindAsync(evaluationId);
            if (evaluation == null)
            {
                _logger.LogWarning("Evaluation {EvaluationId} not found for status update", evaluationId);
                return false;
            }

            // Business rules for status changes
            if (IsEmployee(user))
            {
                _logger.LogWarning("Employee {UserId} attempted to change evaluation status - not allowed",
                    GetUserId(user));
                return false;
            }

            var oldStatus = evaluation.Status;
            evaluation.Status = status.ToString();

            if (status == EvaluationStatus.Completed)
            {
                evaluation.CompletedDate = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();

            _logger.LogInformation("Evaluation {EvaluationId} status changed from {OldStatus} to {NewStatus} by user {UserId}",
                evaluationId, oldStatus, status, GetUserId(user));

            return true;
        }
        
        /// <summary>
        /// Updates basic evaluation information using primitive parameters
        /// </summary>
        /// <param name="evaluationId">ID of evaluation to update</param>
        /// <param name="period">New period value (optional)</param>
        /// <param name="startDate">New start date (optional)</param>
        /// <param name="endDate">New end date (optional)</param>
        /// <param name="generalComments">New general comments (optional)</param>
        /// <param name="user">Requesting user claims</param>
        /// <returns>Updated evaluation entity or null if not found/accessible</returns>
        public async Task<Evaluation?> UpdateBasicInfoAsync(
            int evaluationId, 
            string? period, 
            DateTime? startDate, 
            DateTime? endDate, 
            string? generalComments, 
            ClaimsPrincipal user)
        {
            try
            {
                // Check if user can access this evaluation
                if (!await CanAccessAsync(evaluationId, user))
                {
                    _logger.LogWarning("User {UserId} denied access to update evaluation {EvaluationId}", 
                        GetUserId(user), evaluationId);
                    return null;
                }

                var evaluation = await _dbSet.FindAsync(evaluationId);
                if (evaluation == null) 
                {
                    _logger.LogWarning("Evaluation {EvaluationId} not found for update", evaluationId);
                    return null;
                }

                // Check if evaluation is editable
                if (evaluation.Status == EvaluationStatus.Completed.ToString() || 
                    evaluation.Status == EvaluationStatus.Approved.ToString())
                {
                    if (!IsAdmin(user))
                    {
                        _logger.LogWarning("Non-admin user {UserId} attempted to modify completed evaluation {EvaluationId}", 
                            GetUserId(user), evaluationId);
                        throw new InvalidOperationException("Cannot modify completed evaluation");
                    }
                }

                // Update only provided fields (null means don't update)
                if (!string.IsNullOrWhiteSpace(period))
                {
                    evaluation.Period = period.Trim();
                }

                if (startDate.HasValue)
                {
                    evaluation.StartDate = startDate.Value;
                }

                if (endDate.HasValue)
                {
                    evaluation.EndDate = endDate.Value;
                }

                if (generalComments != null) // Allow empty string to clear comments
                {
                    evaluation.GeneralComments = generalComments.Trim();
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Evaluation basic info updated: ID {EvaluationId} by User {UserId}", 
                    evaluationId, GetUserId(user));

                return evaluation;
            }
            catch (InvalidOperationException)
            {
                // Re-throw business rule violations
                throw;
            }
            catch (Exception ex)
            {
                var userId = GetUserId(user);
                _logger.LogError(ex, "Error updating basic info for evaluation {EvaluationId} by user {UserId}", 
                    evaluationId, userId);
                throw;
            }
        }

        public async Task<bool> UpdateTotalScoreAsync(int evaluationId, decimal totalScore)
        {
            var evaluation = await _dbSet.FindAsync(evaluationId);
            if (evaluation == null) return false;

            evaluation.TotalScore = totalScore;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Evaluation total score updated: ID {EvaluationId}, Score: {TotalScore}",
                evaluationId, totalScore);

            return true;
        }
        public async Task<Evaluation?> GetEvaluationForSummaryAsync(int evaluationId, ClaimsPrincipal user)
        {
            if (!await CanAccessAsync(evaluationId, user))
            {
                return null;
            }

            return await _dbSet
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Include(e => e.EvaluationScores) 
                .FirstOrDefaultAsync(e => e.ID == evaluationId);
        }

        public async Task<IEnumerable<Evaluation>> GetRecentEvaluationsAsync(ClaimsPrincipal user, int limit = 10)
        {
            var query = GetBaseEvaluationQuery();

            if (IsEvaluator(user))
            {
                var evaluatorId = GetUserId(user);
                query = query.Where(e => e.EvaluatorID == evaluatorId);
            }
            else if (IsEmployee(user))
            {
                var employeeId = GetUserId(user);
                query = query.Where(e => e.EmployeeID == employeeId);
            }

            return await query
                .OrderByDescending(e => e.CreatedDate)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<bool> IsEvaluationEditableAsync(int evaluationId, ClaimsPrincipal user)
        {
            if (!await CanAccessAsync(evaluationId, user))
            {
                return false;
            }

            var evaluation = await _dbSet
                .Where(e => e.ID == evaluationId)
                .Select(e => e.Status)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(evaluation))
            {
                return false;
            }

            if (evaluation == EvaluationStatus.Completed.ToString() ||
                evaluation == EvaluationStatus.Approved.ToString())
            {
                return IsAdmin(user);
            }

            return true;
        }

        public async Task<Dictionary<string, int>> GetEvaluationCountsByStatusAsync(ClaimsPrincipal user)
        {
            var query = _dbSet.AsQueryable();

            // Apply role filtering
            if (IsEvaluator(user))
            {
                var evaluatorId = GetUserId(user);
                query = query.Where(e => e.EvaluatorID == evaluatorId);
            }
            else if (IsEmployee(user))
            {
                var employeeId = GetUserId(user);
                query = query.Where(e => e.EmployeeID == employeeId);
            }
            // Admin sees all - no additional filtering

            return await query
                .GroupBy(e => e.Status)
                .ToDictionaryAsync(g => g.Key, g => g.Count());
        }

        /// <summary>
        /// Creates new evaluation using primitive parameters
        /// </summary>
        /// <param name="employeeId">ID of employee being evaluated</param>
        /// <param name="period">Evaluation period</param>
        /// <param name="startDate">Evaluation start date</param>
        /// <param name="endDate">Evaluation end date</param>
        /// <param name="user">Requesting user claims</param>
        /// <returns>Created evaluation entity</returns>
        public async Task<Evaluation> CreateEvaluationAsync(
            int employeeId, 
            string period, 
            DateTime startDate, 
            DateTime endDate, 
            ClaimsPrincipal user)
        {
            try
            {
                var evaluatorId = GetUserId(user);
                
                // Validate evaluator can evaluate this employee
                var canEvaluate = await CanEvaluateEmployeeAsync(evaluatorId, employeeId);
                if (!canEvaluate)
                {
                    _logger.LogWarning("Evaluator {EvaluatorId} attempted to evaluate employee {EmployeeId} without permission", 
                        evaluatorId, employeeId);
                    throw new UnauthorizedAccessException("Cannot evaluate this employee");
                }

                var evaluation = new Evaluation
                {
                    EvaluatorID = evaluatorId,
                    EmployeeID = employeeId,
                    Period = period.Trim(),
                    StartDate = startDate,
                    EndDate = endDate,
                    Status = EvaluationStatus.Draft.ToString(),
                    TotalScore = 0,
                    CreatedDate = DateTime.UtcNow
                };

                await _dbSet.AddAsync(evaluation);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Evaluation created: ID {EvaluationId} by User {UserId} for Employee {EmployeeId}", 
                    evaluation.ID, evaluatorId, employeeId);

                return evaluation;
            }
            catch (UnauthorizedAccessException)
            {
                // Re-throw authorization errors
                throw;
            }
            catch (Exception ex)
            {
                var evaluatorId = GetUserId(user);
                _logger.LogError(ex, "Error creating evaluation. Evaluator: {EvaluatorId}, Employee: {EmployeeId}", 
                    evaluatorId, employeeId);
                throw;
            }
        }

        /// <summary>
        /// Gets evaluation with scores for form display (no comments)
        /// </summary>
        public async Task<Evaluation?> GetEvaluationWithScoresAsync(int evaluationId, ClaimsPrincipal user)
        {
            if (!await CanAccessAsync(evaluationId, user))
            {
                return null;
            }

            return await _dbSet
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                        .ThenInclude(c => c.CriteriaCategory)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Comments)
                .FirstOrDefaultAsync(e => e.ID == evaluationId);
        }
        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            try
            {
                var transaction = await _context.Database.BeginTransactionAsync();
                
                _logger.LogDebug("Database transaction started for evaluation operations");
                
                return transaction;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting database transaction");
                throw;
            }
        }

        public async Task<bool> DeactivateEvaluationAsync(int evaluationId, ClaimsPrincipal requestingUser)
        {
            try
            {
                var evaluation = await _dbSet.FirstOrDefaultAsync(e => e.ID == evaluationId && e.IsActive);
                if (evaluation == null)
                {
                    return false;
                }

                if (!await CanAccessAsync(evaluationId, requestingUser))
                {
                    throw new UnauthorizedAccessException("Cannot access this evaluation");
                }

                evaluation.IsActive = false;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Evaluation deactivated: ID {evaluationId} by User {userId}", 
                    evaluationId, GetUserId(requestingUser));
                return true;
            }
            catch (UnauthorizedAccessException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating evaluation {evaluationId}", evaluationId);
                throw;
            }
        }

        public async Task<bool> ReactivateEvaluationAsync(int evaluationId, ClaimsPrincipal requestingUser)
        {
            try
            {
                var evaluation = await _dbSet.FirstOrDefaultAsync(e => e.ID == evaluationId && !e.IsActive);
                if (evaluation == null)
                {
                    return false;
                }

                if (!IsAdmin(requestingUser))
                {
                    throw new UnauthorizedAccessException("Only administrators can reactivate evaluations");
                }

                evaluation.IsActive = true;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Evaluation reactivated: ID {evaluationId} by Admin {userId}", 
                    evaluationId, GetUserId(requestingUser));
                return true;
            }
            catch (UnauthorizedAccessException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating evaluation {evaluationId}", evaluationId);
                throw;
            }
        }

        public async Task<bool> CascadeDeactivateEvaluationAsync(int evaluationId, ClaimsPrincipal requestingUser)
        {
            try
            {
                var evaluation = await _dbSet
                    .Include(e => e.EvaluationScores.Where(es => es.IsActive))
                        .ThenInclude(es => es.Comments.Where(c => c.IsActive))
                    .FirstOrDefaultAsync(e => e.ID == evaluationId && e.IsActive);

                if (evaluation == null)
                {
                    return false;
                }

                if (!await CanAccessAsync(evaluationId, requestingUser))
                {
                    throw new UnauthorizedAccessException("Cannot access this evaluation");
                }

                using var transaction = await _context.Database.BeginTransactionAsync();
                
                try
                {
                    var deactivationTime = DateTime.UtcNow;

                    // Deactivate all scores and comments
                    foreach (var score in evaluation.EvaluationScores.Where(es => es.IsActive))
                    {
                        score.IsActive = false;
                        
                        foreach (var comment in score.Comments.Where(c => c.IsActive))
                        {
                            comment.IsActive = false;
                            comment.UpdatedDate = deactivationTime;
                        }
                    }

                    // Deactivate the evaluation
                    evaluation.IsActive = false;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    _logger.LogInformation("Evaluation and related data cascade deactivated: ID {evaluationId} by User {userId}", 
                        evaluationId, GetUserId(requestingUser));
                    return true;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Error during cascade deactivation for evaluation {evaluationId}", evaluationId);
                    throw;
                }
            }
            catch (UnauthorizedAccessException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cascade deactivating evaluation {evaluationId}", evaluationId);
                throw;
            }
        }
        
        private IQueryable<Evaluation> GetBaseEvaluationQuery()
        {
            return _dbSet
                .Include(e => e.Evaluator)
                .Include(e => e.Employee)
                    .ThenInclude(emp => emp.Department);
        }

        private IQueryable<Evaluation> GetDetailedEvaluationQuery()
        {
            return _dbSet
                .Include(e => e.Evaluator)
                .Include(e => e.Employee)
                    .ThenInclude(emp => emp.Department)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                        .ThenInclude(c => c.CriteriaCategory);
        }

        private async Task<List<int>> GetTeamMemberIdsAsync(int evaluatorId)
        {
            return await _context.EvaluatorAssignments
                .Where(ea => ea.EvaluatorID == evaluatorId && ea.IsActive)
                .Select(ea => ea.EmployeeID)
                .Distinct()
                .ToListAsync();
        }
    }
}