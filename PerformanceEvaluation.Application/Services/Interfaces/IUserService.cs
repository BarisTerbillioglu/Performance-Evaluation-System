using System.Security.Claims;
using PerformanceEvaluation.Application.DTOs.User;
using PerformanceEvaluation.Application.DTOs.Role;
using PerformanceEvaluation.Application.DTOs.Evaluation;
using PerformanceEvaluation.Application.DTOs.Team;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserListDto>> GetUserListAsync(ClaimsPrincipal user);
        Task<IEnumerable<UserListDto>> GetUserListInATeamAsync(ClaimsPrincipal user);
        Task<IEnumerable<EvaluatorListDto>> GetEvaluatorListAsync(ClaimsPrincipal user);
        Task<IEnumerable<EmployeeListDto>> GetEmployeeListAsync(ClaimsPrincipal user);
        Task<IEnumerable<EmployeeListDto>> GetEmployeeListInADepartmentAsync(ClaimsPrincipal user, int id);
        Task<IEnumerable<EvaluationDto>> GetUserEvaluationsAsync(ClaimsPrincipal user, int id);
        Task<UserDto> CreateUserAsync(CreateUserRequest request, ClaimsPrincipal user);
        Task<SystemRoleDto> UpdateSystemRoleAsync(UpdateSystemRoleRequest request, ClaimsPrincipal user);
        Task<JobRoleDto> UpdateSystemRoleAsync(UpdateJobRoleRequest request, ClaimsPrincipal user);
        Task<TeamDto> UpdateUserTeamAsync(UpdateUserTeamRequest request, ClaimsPrincipal user);
        Task<UserDto> UpdateUserAsync(ClaimsPrincipal user, int id);
        Task<bool> DeleteUserAsync(int id, ClaimsPrincipal user);
        
    }
}