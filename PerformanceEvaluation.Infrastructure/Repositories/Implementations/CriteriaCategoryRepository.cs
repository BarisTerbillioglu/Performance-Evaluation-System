using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Implementation
{
    public class CriteriaCategoryRepository : BaseRepository<CriteriaCategory>, ICriteriaCategoryRepository
    {
        public CriteriaCategoryRepository(ApplicationDbContext context, ILogger<CriteriaCategoryRepository> logger)
            : base(context, logger) { }

        public async Task<bool> CanAccessAsync(int id, ClaimsPrincipal user)
        {
            var category = await _dbSet.FindAsync(id);
            if (category == null) return false;

            if (IsAdmin(user)) return true;

            return category.IsActive;
        }

        public async Task<IEnumerable<CriteriaCategory>> GetAllAsync(ClaimsPrincipal user)
        {
            if (IsAdmin(user))
            {
                return await GetAllCategoriesAsync();
            }
            return await GetActiveCategoriesAsync();
        }

        public async Task<CriteriaCategory?> GetByIdAsync(int id, ClaimsPrincipal user)
        {
            if (IsAdmin(user))
            {
                return await _dbSet
                    .Include(cc => cc.Criteria)
                    .FirstOrDefaultAsync(cc => cc.ID == id);
            }

            return await _dbSet
                .Include(cc => cc.Criteria.Where(c => c.IsActive))
                .FirstOrDefaultAsync(cc => cc.ID == id && cc.IsActive);
        }

        public async Task<IEnumerable<CriteriaCategory>> GetAllCategoriesAsync()
        {
            return await _dbSet
                .Include(cc => cc.Criteria)
                .Where(cc => cc.IsActive)
                .OrderBy(cc => cc.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<CriteriaCategory>> GetActiveCategoriesAsync()
        {
            return await _dbSet
                .Include(cc => cc.Criteria.Where(c => c.IsActive))
                .Where(cc => cc.IsActive)
                .OrderBy(cc => cc.Name)
                .ToListAsync();
        }

        public async Task<CriteriaCategory?> GetCategoryWithCriteriaAsync(int categoryId)
        {
            return await _dbSet
                .Include(cc => cc.Criteria)
                    .ThenInclude(c => c.RoleCriteriaDescriptions)
                        .ThenInclude(rcd => rcd.Role)
                .FirstOrDefaultAsync(cc => cc.ID == categoryId);
        }

        public async Task<bool> ValidateWeightsAsync()
        {
            var totalWeight = await GetTotalWeightAsync();
            return Math.Abs(totalWeight - 100) < 0.01m; // Allow for small floating point differences
        }

        public async Task<decimal> GetTotalWeightAsync()
        {
            return await _dbSet
                .Where(cc => cc.IsActive)
                .SumAsync(cc => cc.Weight);
        }
        
        public async Task<bool> DeactivateAsync(int categoryId)
        {
            try
            {
                var category = await _dbSet.FirstOrDefaultAsync(c => c.ID == categoryId && c.IsActive);
                if (category == null)
                {
                    return false;
                }

                category.IsActive = false;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Criteria category deactivated: ID {categoryId}", categoryId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating criteria category {categoryId}", categoryId);
                throw;
            }
        }

        public async Task<bool> ReactivateAsync(int categoryId)
        {
            try
            {
                var category = await _dbSet.FirstOrDefaultAsync(c => c.ID == categoryId && !c.IsActive);
                if (category == null)
                {
                    return false;
                }

                category.IsActive = true;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Criteria category reactivated: ID {categoryId}", categoryId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating criteria category {categoryId}", categoryId);
                throw;
            }
        }

        public async Task<IEnumerable<Criteria>> GetCategoryCriteriaAsync(int categoryId)
        {
            return await _context.Criteria
                .Where(c => c.CategoryID == categoryId)
                .ToListAsync();
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }
    }
}