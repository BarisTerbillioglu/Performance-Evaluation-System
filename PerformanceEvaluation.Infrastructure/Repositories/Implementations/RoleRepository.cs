using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Implementation
{
    public class RoleRepository : BaseRepository<Role>, IRoleRepository
    {
        public RoleRepository(ApplicationDbContext context, ILogger<RoleRepository> logger) 
            : base(context, logger) { }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public async Task<IEnumerable<Role>> GetJobRolesAsync()
        {
            return await _dbSet
                .Where(r => r.ID > 3 && r.IsActive)
                .OrderBy(r => r.Name)
                .ToListAsync();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="roleName"></param>
        /// <returns></returns>
        public async Task<Role?> GetRoleByNameAsync(string roleName)
        {
            return await _dbSet
                .Include(r => r.Name)
                .Include(r => r.Description)
                .FirstOrDefaultAsync(r => r.Name == roleName && r.IsActive);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public async Task<IEnumerable<Role>> GetSystemRolesAsync()
        {
            return await _dbSet
                .Where(r => r.ID <= 3 && r.IsActive)
                .OrderBy(r => r.Name)
                .ToListAsync();
        }
    }
}