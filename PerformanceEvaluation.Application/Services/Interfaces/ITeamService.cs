using System.Security.Claims;
using PerformanceEvaluation.Application.DTOs.Team;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface ITeamService
    {
        Task<TeamDto> CreateTeamAsync(CreateTeamRequest request, ClaimsPrincipal user);
        Task<TeamDto?> UpdateTeamAsync(int id, UpdateTeamRequest request, ClaimsPrincipal user);
        Task<bool> DeleteTeamAsync(int id, ClaimsPrincipal user);
        Task<IEnumerable<TeamDto>> GetAllTeamsAsync(ClaimsPrincipal user);
        Task<TeamDto?> GetTeamByIdAsync(int id, ClaimsPrincipal user);
        Task<TeamWithMembersDto?> GetTeamWithMembersAsync(int id, ClaimsPrincipal user);
        Task<TeamAssignmentDto> AssignEvaluatorToTeamAsync(AssignEvaluatorRequest request, ClaimsPrincipal user);
        Task<TeamAssignmentDto> AssignEmployeeToTeamAsync(AssignEmployeeRequest request, ClaimsPrincipal user);
        Task<bool> RemoveUserFromTeamAsync(int teamId, int userId, ClaimsPrincipal user);
        Task<IEnumerable<TeamAssignmentDto>> GetTeamAssignmentsAsync(int teamId, ClaimsPrincipal user);
        Task<bool> CascadeDeactivateTeamAsync(int id, ClaimsPrincipal user);
        Task<bool> ReactivateTeamAsync(int id, ClaimsPrincipal user);
        Task<bool> DeactivateTeamAsync(int id, ClaimsPrincipal user);
    }
}