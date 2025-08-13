using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Core.Interfaces;
using PerformanceEvaluation.Infrastructure.Data;

namespace PerformanceEvaluation.Infrastructure.Repositories.Implementation
{
    public abstract class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        protected readonly ApplicationDbContext _context;
        protected readonly DbSet<T> _dbSet;
        protected readonly ILogger _logger;

        protected BaseRepository(ApplicationDbContext context, ILogger logger)
        {
            _context = context;
            _dbSet = context.Set<T>();
            _logger = logger;
        }

        public async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int ID)
        {
            var entity = await GetByIdAsync(ID);
            if (entity == null)
            {
                return false;
            }
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int ID)
        {
            return await _dbSet.FindAsync(ID) != null;
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<T?> GetByIdAsync(int ID)
        {
            return await _dbSet.FindAsync(ID);
        }

        public async Task<T> UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        // Helper methods for role extraction
        protected int GetUserId(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }

        protected bool IsAdmin(ClaimsPrincipal user)
        {
            return user.IsInRole("Admin");
        }

        protected bool IsEvaluator(ClaimsPrincipal user)
        {
            return user.IsInRole("Evaluator");
        }

        protected bool IsEmployee(ClaimsPrincipal user)
        {
            return user.IsInRole("Employee");
        }

        protected int GetDepartmentId(ClaimsPrincipal user)
        {
            var deptIdClaim = user.FindFirst("DepartmentID")?.Value;
            return int.TryParse(deptIdClaim, out int deptId) ? deptId : 0;
        }
    }
}