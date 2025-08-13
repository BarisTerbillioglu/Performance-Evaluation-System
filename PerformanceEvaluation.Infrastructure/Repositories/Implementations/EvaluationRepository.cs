using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
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
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                        .ThenInclude(c => c.CriteriaCategory)
                .Include(e => e.Period)
                .Include(e => e.Status)
                .Include(e => e.TotalScore)
                .OrderByDescending(e => e.CreatedDate)
                .ToListAsync();
        }

        public async Task<Evaluation?> GetByIdAsync(int id, ClaimsPrincipal user)
        {
            var query = _dbSet
                .Include(e => e.Period)
                .Include(e => e.Evaluator)
                .Include(e => e.Employee)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                        .ThenInclude(c => c.CriteriaCategory)
                .Include(e => e.TotalScore)
                .Include(e => e.Status)
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
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                        .ThenInclude(c => c.CriteriaCategory)
                .Include(e => e.Period)
                .Include(e => e.Status)
                .Include(e => e.TotalScore)
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
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Score)
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
                .Include(e => e.TotalScore)
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
                .Include(e => e.TotalScore)
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
    }
}