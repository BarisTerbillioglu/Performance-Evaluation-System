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
                .Include(r => r.RoleCriteriaDescriptions)
                    .ThenInclude(rcd => rcd.Criteria)
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
        public async Task<RoleAssignment?> GetUserRoleAssignmentAsync(int userId, int roleId)
        {
            return await _context.RoleAssignments
                .Include(ra => ra.Role)
                .Include(ra => ra.User)
                .FirstOrDefaultAsync(ra => ra.UserID == userId && ra.RoleID == roleId);
        }

        public async Task<RoleAssignment> AddRoleAssignmentAsync(RoleAssignment roleAssignment)
        {
            await _context.RoleAssignments.AddAsync(roleAssignment);
            await _context.SaveChangesAsync();

            // Load related entities
            await _context.Entry(roleAssignment)
                .Reference(ra => ra.Role)
                .LoadAsync();
            await _context.Entry(roleAssignment)
                .Reference(ra => ra.User)
                .LoadAsync();

            return roleAssignment;
        }

        public async Task<bool> RemoveRoleAssignmentAsync(int userId, int roleId)
        {
            var assignment = await _context.RoleAssignments
                .FirstOrDefaultAsync(ra => ra.UserID == userId && ra.RoleID == roleId);

            if (assignment == null)
            {
                return false;
            }

            _context.RoleAssignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeactivateAsync(int roleId)
        {
            try
            {
                var role = await _dbSet.FirstOrDefaultAsync(r => r.ID == roleId && r.IsActive);
                if (role == null)
                {
                    return false;
                }

                role.IsActive = false;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Role deactivated: ID {roleId}", roleId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating role {roleId}", roleId);
                throw;
            }
        }

        public async Task<bool> ReactivateAsync(int roleId)
        {
            try
            {
                var role = await _dbSet.FirstOrDefaultAsync(r => r.ID == roleId && !r.IsActive);
                if (role == null)
                {
                    return false;
                }

                role.IsActive = true;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Role reactivated: ID {roleId}", roleId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating role {roleId}", roleId);
                throw;
            }
        }

        public async Task<IEnumerable<RoleAssignment>> GetRoleAssignmentsAsync(int roleId)
        {
            return await _context.RoleAssignments
                .Include(ra => ra.User)
                .Where(ra => ra.RoleID == roleId)
                .ToListAsync();
        }

        public async Task<IEnumerable<RoleAssignment>> GetUserRoleAssignmentsAsync(int userId)
        {
            return await _context.RoleAssignments
                .Include(ra => ra.Role)
                .Include(ra => ra.User)
                .Where(ra => ra.UserID == userId && ra.IsActive)
                .OrderBy(ra => ra.Role.Name)
                .ToListAsync();
        }
        
    }
}