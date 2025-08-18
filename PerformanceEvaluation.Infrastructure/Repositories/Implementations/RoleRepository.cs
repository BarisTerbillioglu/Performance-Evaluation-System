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

        public async Task<IEnumerable<RoleAssignment>> GetUserRoleAssignmentsAsync(int userId)
        {
            return await _context.RoleAssignments
                .Include(ra => ra.Role)
                .Include(ra => ra.User)
                .Where(ra => ra.UserID == userId)
                .OrderBy(ra => ra.Role.Name)
                .ToListAsync();
        }
    }
}