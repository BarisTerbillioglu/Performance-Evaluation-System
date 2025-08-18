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
        
        public async Task<RoleCriteriaDescription> AddRoleDescriptionAsync(RoleCriteriaDescription roleDescription)
        {
            // Check if description already exists for this criteria-role combination
            var existing = await _context.RoleCriteriaDescriptions
                .FirstOrDefaultAsync(rcd => rcd.CriteriaID == roleDescription.CriteriaID && 
                                        rcd.RoleID == roleDescription.RoleID);

            if (existing != null)
            {
                throw new InvalidOperationException("Role description already exists for this criteria-role combination");
            }

            await _context.RoleCriteriaDescriptions.AddAsync(roleDescription);
            await _context.SaveChangesAsync();

            return roleDescription;
        }

        public async Task<RoleCriteriaDescription?> UpdateRoleDescriptionAsync(int id, string description, string? example)
        {
            var roleDescription = await _context.RoleCriteriaDescriptions.FindAsync(id);
            
            if (roleDescription == null)
            {
                return null;
            }

            roleDescription.Description = description.Trim();
            roleDescription.Example = example?.Trim();

            await _context.SaveChangesAsync();
            return roleDescription;
        }

        public async Task<bool> DeleteRoleDescriptionAsync(int id)
        {
            var roleDescription = await _context.RoleCriteriaDescriptions.FindAsync(id);
            
            if (roleDescription == null)
            {
                return false;
            }

            _context.RoleCriteriaDescriptions.Remove(roleDescription);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}