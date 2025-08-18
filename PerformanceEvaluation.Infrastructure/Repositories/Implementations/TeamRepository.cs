using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Implementation
{
    public class TeamRepository : BaseRepository<Team>, ITeamRepository
    {
        public TeamRepository(ApplicationDbContext context, ILogger<TeamRepository> logger) 
            : base(context, logger) { }

        public async Task<bool> CanAccessAsync(int id, ClaimsPrincipal user)
        {
            if (IsAdmin(user)) return true;

            // Evaluators can see teams they're assigned to
            if (IsEvaluator(user))
            {
                var evaluatorId = GetUserId(user);
                return await _context.EvaluatorAssignments
                    .AnyAsync(ea => ea.TeamID == id && ea.EvaluatorID == evaluatorId && ea.IsActive);
            }

            // Employees can see teams they're assigned to
            if (IsEmployee(user))
            {
                var employeeId = GetUserId(user);
                return await _context.EvaluatorAssignments
                    .AnyAsync(ea => ea.TeamID == id && ea.EmployeeID == employeeId && ea.IsActive);
            }

            return false;
        }

        public async Task<IEnumerable<Team>> GetAllAsync(ClaimsPrincipal user)
        {
            if (IsAdmin(user))
            {
                return await GetAllTeamsAsync();
            }

            var userId = GetUserId(user);
            var accessibleTeamIds = await _context.EvaluatorAssignments
                .Where(ea => (ea.EvaluatorID == userId || ea.EmployeeID == userId) && ea.IsActive)
                .Select(ea => ea.TeamID)
                .Distinct()
                .ToListAsync();

            return await _dbSet
                .Where(t => accessibleTeamIds.Contains(t.ID) && t.IsActive)
                .ToListAsync();
        }

        public async Task<Team?> GetByIdAsync(int id, ClaimsPrincipal user)
        {
            if (!await CanAccessAsync(id, user))
            {
                return null;
            }

            return await _dbSet
                .Include(t => t.EvaluatorAssignments)
                .FirstOrDefaultAsync(t => t.ID == id);
        }

        public async Task<IEnumerable<Team>> GetAllTeamsAsync()
        {
            return await _dbSet
                .Include(t => t.EvaluatorAssignments)
                    .ThenInclude(ea => ea.Evaluator)
                .Include(t => t.EvaluatorAssignments)
                    .ThenInclude(ea => ea.Employee)
                .ToListAsync();
        }

        public async Task<Team?> GetTeamWithMembersAsync(int teamId)
        {
            return await _dbSet
                .Include(t => t.EvaluatorAssignments.Where(ea => ea.IsActive))
                    .ThenInclude(ea => ea.Evaluator)
                .Include(t => t.EvaluatorAssignments.Where(ea => ea.IsActive))
                    .ThenInclude(ea => ea.Employee)
                .FirstOrDefaultAsync(t => t.ID == teamId);
        }
    }
}