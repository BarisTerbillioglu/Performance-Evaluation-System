using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Interfaces
{
    public interface IRoleRepository : IBaseRepository<Role>
    {
        Task<IEnumerable<Role>> GetSystemRolesAsync();
        Task<IEnumerable<Role>> GetJobRolesAsync();
        Task<Role?> GetRoleByNameAsync(string roleName);
        Task<RoleAssignment?> GetUserRoleAssignmentAsync(int userId, int roleId);
        Task<RoleAssignment> AddRoleAssignmentAsync(RoleAssignment roleAssignment);
        Task<bool> RemoveRoleAssignmentAsync(int userId, int roleId);
        Task<IEnumerable<RoleAssignment>> GetUserRoleAssignmentsAsync(int userId);
        Task<IEnumerable<RoleAssignment>> GetRoleAssignmentsAsync(int roleId);
        Task<bool> ReactivateAsync(int roleId);
        Task<bool> DeactivateAsync(int roleId);
    }
}