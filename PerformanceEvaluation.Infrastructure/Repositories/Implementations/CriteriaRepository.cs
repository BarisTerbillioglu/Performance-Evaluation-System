using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Enums;
using PerformanceEvaluation.Core.Interfaces;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Implementation
{
    public class CriteriaRepository : BaseRepository<Criteria>, ICriteriaRepository
    {
        public CriteriaRepository(ApplicationDbContext context, ILogger<CriteriaRepository> logger)
            : base(context, logger) { }

        public async Task<bool> CanAccessAsync(int id, ClaimsPrincipal user)
        {
            var criteria = await _dbSet.FindAsync(id);
            if (criteria == null) return false;

            if (IsAdmin(user)) return true;

            return criteria.IsActive;
        }

        public async Task<IEnumerable<Criteria>> GetActiveCriteriaForEvaluationAsync()
        {
            return await _dbSet
                .Include(c => c.CriteriaCategory)
                .Include(c => c.RoleCriteriaDescriptions)
                    .ThenInclude(rcd => rcd.Role)
                    .ThenInclude(rcd => rcd.Description)
                .Where(c => c.IsActive && c.CriteriaCategory.IsActive)
                .OrderBy(c => c.CriteriaCategory.Name)
                    .ThenBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Criteria>> GetAllAsync(ClaimsPrincipal user)
        {
            if (IsAdmin(user))
            {
                return await GetAllCriteriaAsync();
            }
            return await GetActiveCriteriaForEvaluationAsync();
        }

        public async Task<IEnumerable<Criteria>> GetAllCriteriaAsync()
        {
            return await _dbSet
                .Include(c => c.CriteriaCategory)
                .Include(c => c.RoleCriteriaDescriptions)
                    .ThenInclude(rcd => rcd.Role)
                    .ThenInclude(rcd => rcd.Description)
                .OrderBy(c => c.CriteriaCategory.Name)
                    .ThenBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Criteria?> GetByIdAsync(int id, ClaimsPrincipal user)
        {
            if (IsAdmin(user))
            {
                return await _dbSet
                    .Include(c => c.CriteriaCategory)
                    .Include(c => c.RoleCriteriaDescriptions)
                        .ThenInclude(rcd => rcd.Role)
                        .ThenInclude(rcd => rcd.Description)
                    .FirstOrDefaultAsync(c => c.ID == id);
            }

            return await _dbSet
                    .Include(c => c.CriteriaCategory)
                    .Include(c => c.RoleCriteriaDescriptions)
                        .ThenInclude(rcd => rcd.Role)
                        .ThenInclude(rcd => rcd.Description)
                    .FirstOrDefaultAsync(c => c.ID == id && c.IsActive);
        }

        public async Task<IEnumerable<Criteria>> GetCriteriaByCategoryAsync(int categoryId)
        {
            return await _dbSet
                .Include(c => c.CriteriaCategory)
                .Include(c => c.RoleCriteriaDescriptions)
                    .ThenInclude(rcd => rcd.Role)
                    .ThenInclude(rcd => rcd.Description)
                .Where(c => c.CategoryID == categoryId)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Criteria>> GetCriteriaForRoleAsync(SystemRole systemRole, JobRoleType jobRole)
        {
            var roleIds = new List<int> { (int)systemRole };

            if (jobRole == JobRoleType.BusinessAnalyst) roleIds.Add(4);
            else if (jobRole == JobRoleType.Developer) roleIds.Add(5);
            else if (jobRole == JobRoleType.QASpecialist) roleIds.Add(6);

            return await _dbSet
                .Include(c => c.CriteriaCategory)
                .Include(c => c.RoleCriteriaDescriptions.Where(rcd => roleIds.Contains(rcd.RoleID)))
                    .ThenInclude(rcd => rcd.Role)
                .Where(c => c.IsActive && 
                           c.RoleCriteriaDescriptions.Any(rcd => roleIds.Contains(rcd.RoleID)))
                .OrderBy(c => c.CriteriaCategory.Name)
                    .ThenBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Criteria?> GetCriteriaWithRoleDescriptionAsync(int criteriaId, int roleId)
        {
            return await _dbSet
                .Include(c => c.CriteriaCategory)
                .Include(c => c.RoleCriteriaDescriptions.Where(rcd => rcd.RoleID == roleId))
                    .ThenInclude(rcd => rcd.Role)
                    .ThenInclude(rcd => rcd.Description)
                .FirstOrDefaultAsync(c => c.ID == criteriaId && c.IsActive);
        }
    }
}