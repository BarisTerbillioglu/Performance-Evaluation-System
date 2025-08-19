using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Implementation
{
    public class DepartmentRepository : BaseRepository<Department>, IDepartmentRepository
    {
        public DepartmentRepository(ApplicationDbContext context, ILogger<DepartmentRepository> logger) 
            : base(context, logger) { }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public async Task<bool> CanAccessAsync(int id, ClaimsPrincipal user)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            if (IsAdmin(user)) return true;

            var userDeptId = GetDepartmentId(user);
            return userDeptId == id;
        }

        public async Task<IEnumerable<Department>> GetAllAsync(ClaimsPrincipal user)
        {
            if (IsAdmin(user))
            {
                return await GetAllDepartmentsAsync();
            }
            return new List<Department>();
        }

        public async Task<IEnumerable<Department>> GetAllDepartmentsAsync()
        {
            return await _dbSet
                .Include(d => d.Users)
                .ToListAsync();
        }

        public async Task<Department?> GetByIdAsync(int id, ClaimsPrincipal user)
        {
            if (IsAdmin(user))
            {
                return await GetByIdAsync(id);
            }

            var userDeptId = GetDepartmentId(user);
            return id == userDeptId ? await GetByIdAsync(id, user) : null;
        }

        public async Task<IEnumerable<User>> GetDepartmentUsersAsync(int departmentId, ClaimsPrincipal user)
        {
            if (!await CanAccessAsync(departmentId, user))
            {
                return await _context.Users
                    .Include(u => u.Department)
                    .Where(u => u.DepartmentID == departmentId)
                    .Distinct()
                    .ToListAsync();
            }

            return new List<User>();
        }

        public async Task<Department?> GetMyDepartmentAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.ID == userId);

            return user?.Department;
        }
    }
}