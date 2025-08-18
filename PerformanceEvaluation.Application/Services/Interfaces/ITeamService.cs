using System.Security.Claims;
using PerformanceEvaluation.Application.DTOs.Team;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface ITeamService
    {
        Task<TeamDto> CreateTeamAsync(CreateTeamRequest request, ClaimsPrincipal user);
        Task<TeamDto> UpdateTeamAsync(ClaimsPrincipal user, int id);
        Task<bool> DeleteTeamAsync(int id, ClaimsPrincipal user);
    }
}