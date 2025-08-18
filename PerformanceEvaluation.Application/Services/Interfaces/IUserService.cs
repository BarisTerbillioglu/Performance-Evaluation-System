using System.Security.Claims;
using PerformanceEvaluation.Application.DTOs.User;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserListDto>> GetUserListAsync(ClaimsPrincipal user);
        Task<IEnumerable<UserListDto>> GetUserListInATeamAsync(int teamId, ClaimsPrincipal user);
        Task<IEnumerable<EvaluatorListDto>> GetEvaluatorListAsync(ClaimsPrincipal user);
        Task<IEnumerable<EmployeeListDto>> GetEmployeeListAsync(ClaimsPrincipal user);
        Task<IEnumerable<EmployeeListDto>> GetEmployeeListInADepartmentAsync(int departmentId, ClaimsPrincipal user);
        Task<UserDto> CreateUserAsync(CreateUserRequest request, ClaimsPrincipal user);
        Task<UserDto?> UpdateUserAsync(int id, UpdateUserRequest request, ClaimsPrincipal user);
        Task<bool> DeleteUserAsync(int id, ClaimsPrincipal user);
        Task<UserWithDetailsDto?> GetUserDetailsAsync(int id, ClaimsPrincipal user);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request, ClaimsPrincipal user);
    }
}
