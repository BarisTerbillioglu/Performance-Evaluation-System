using System.Security.Claims;
using PerformanceEvaluation.Application.DTOs.Role;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface IRoleService
    {
        Task<RoleDto> CreateRoleAsync(CreateRoleRequest request, ClaimsPrincipal user);
        Task<RoleDto?> UpdateRoleAsync(int id, UpdateRoleRequest request, ClaimsPrincipal user);
        Task<bool> DeleteRoleAsync(int id, ClaimsPrincipal user);
        Task<IEnumerable<RoleDto>> GetAllRolesAsync(ClaimsPrincipal user);
        Task<RoleDto?> GetRoleByIdAsync(int id, ClaimsPrincipal user);
        Task<RoleDto?> GetRoleByNameAsync(string name, ClaimsPrincipal user);
        Task<IEnumerable<RoleDto>> GetSystemRolesAsync(ClaimsPrincipal user);
        Task<IEnumerable<RoleDto>> GetJobRolesAsync(ClaimsPrincipal user);
        Task<RoleAssignmentDto> AssignRoleToUserAsync(AssignRoleRequest request, ClaimsPrincipal user);
        Task<bool> RemoveRoleFromUserAsync(int userId, int roleId, ClaimsPrincipal user);
        Task<IEnumerable<RoleAssignmentDto>> GetUserRolesAsync(int userId, ClaimsPrincipal user);
    }
}