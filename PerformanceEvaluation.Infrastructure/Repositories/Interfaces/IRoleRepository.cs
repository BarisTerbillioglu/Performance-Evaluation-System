using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Interfaces
{
    public interface IRoleRepository : IBaseRepository<Role>
    {
        Task<IEnumerable<Role>> GetSystemRolesAsync();
        Task<IEnumerable<Role>> GetJobRolesAsync();
        Task<Role?> GetRoleByNameAsync(string roleName);
    }
}