using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Implementation
{
    public class EvaluatorAssignmentRepository : BaseRepository<EvaluatorAssignment>, IEvaluatorAssignmentRepository
    {
        public EvaluatorAssignmentRepository(ApplicationDbContext context, ILogger<EvaluatorAssignmentRepository> logger)
            : base(context, logger) { }

        public async Task<IEnumerable<EvaluatorAssignment>> GetTeamAssignmentsAsync(int teamId)
        {
            return await _dbSet
                .Include(ea => ea.Evaluator)
                .Include(ea => ea.Employee)
                .Include(ea => ea.Team)
                .Where(ea => ea.TeamID == teamId)
                .OrderBy(ea => ea.AssignedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<EvaluatorAssignment>> GetEvaluatorAssignmentsAsync(int evaluatorId)
        {
            return await _dbSet
                .Include(ea => ea.Evaluator)
                .Include(ea => ea.Employee)
                .Include(ea => ea.Team)
                .Where(ea => ea.EvaluatorID == evaluatorId)
                .OrderBy(ea => ea.AssignedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<EvaluatorAssignment>> GetEmployeeAssignmentsAsync(int employeeId)
        {
            return await _dbSet
                .Include(ea => ea.Evaluator)
                .Include(ea => ea.Employee)
                .Include(ea => ea.Team)
                .Where(ea => ea.EmployeeID == employeeId)
                .OrderBy(ea => ea.AssignedDate)
                .ToListAsync();
        }

        public async Task<EvaluatorAssignment?> GetEvaluatorTeamAssignmentAsync(int evaluatorId, int teamId)
        {
            return await _dbSet
                .Include(ea => ea.Evaluator)
                .Include(ea => ea.Employee)
                .Include(ea => ea.Team)
                .FirstOrDefaultAsync(ea => ea.EvaluatorID == evaluatorId && ea.TeamID == teamId);
        }

        public async Task<EvaluatorAssignment?> GetEvaluatorEmployeeAssignmentAsync(int evaluatorId, int employeeId)
        {
            return await _dbSet
                .Include(ea => ea.Evaluator)
                .Include(ea => ea.Employee)
                .Include(ea => ea.Team)
                .FirstOrDefaultAsync(ea => ea.EvaluatorID == evaluatorId && ea.EmployeeID == employeeId && ea.IsActive);
        }

        public async Task<bool> DeactivateTeamAssignmentAsync(int teamId, int userId)
        {
            var assignments = await _dbSet
                .Where(ea => ea.TeamID == teamId &&
                           (ea.EvaluatorID == userId || ea.EmployeeID == userId) &&
                           ea.IsActive)
                .ToListAsync();

            if (!assignments.Any())
            {
                return false;
            }

            foreach (var assignment in assignments)
            {
                assignment.IsActive = false;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeactivateEvaluatorEmployeeAssignmentAsync(int evaluatorId, int employeeId)
        {
            var assignment = await _dbSet
                .FirstOrDefaultAsync(ea => ea.EvaluatorID == evaluatorId &&
                                         ea.EmployeeID == employeeId &&
                                         ea.IsActive);

            if (assignment == null)
            {
                return false;
            }

            assignment.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> DeactivateAssignmentAsync(int assignmentId)
        {
            try
            {
                var assignment = await _dbSet.FirstOrDefaultAsync(ea => ea.ID == assignmentId && ea.IsActive);
                if (assignment == null)
                {
                    return false;
                }

                assignment.IsActive = false;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Evaluator assignment deactivated: ID {assignmentId}", assignmentId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating assignment {assignmentId}", assignmentId);
                throw;
            }
        }

        public async Task<bool> ReactivateAssignmentAsync(int assignmentId)
        {
            try
            {
                var assignment = await _dbSet.FirstOrDefaultAsync(ea => ea.ID == assignmentId && !ea.IsActive);
                if (assignment == null)
                {
                    return false;
                }

                assignment.IsActive = true;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Evaluator assignment reactivated: ID {assignmentId}", assignmentId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating assignment {assignmentId}", assignmentId);
                throw;
            }
        }

        public async Task<bool> DeactivateUserAssignmentsAsync(int userId)
        {
            try
            {
                var assignments = await _dbSet
                    .Where(ea => (ea.EvaluatorID == userId || ea.EmployeeID == userId) && ea.IsActive)
                    .ToListAsync();

                if (!assignments.Any())
                {
                    return false;
                }

                foreach (var assignment in assignments)
                {
                    assignment.IsActive = false;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("All assignments deactivated for user {userId}, count: {count}", 
                    userId, assignments.Count);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating assignments for user {userId}", userId);
                throw;
            }
        }
    }
}