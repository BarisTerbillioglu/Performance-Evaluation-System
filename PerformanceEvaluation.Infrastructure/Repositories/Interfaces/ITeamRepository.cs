using System.Security.Claims;
using Microsoft.EntityFrameworkCore.Storage;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Interfaces
{
    public interface ITeamRepository : ISecureRepository<Team>
    {
        Task<IEnumerable<Team>> GetAllTeamsAsync(); // Admin only
        Task<Team?> GetTeamWithMembersAsync(int teamId);
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<bool> ReactivateAsync(int teamId);
        Task<bool> DeactivateAsync(int teamId);
    }
}