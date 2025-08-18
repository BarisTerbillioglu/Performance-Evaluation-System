using System.Security.Claims;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Interfaces
{
    public interface IUserRepository : ISecureRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetWithRolesAsync(int userId);
        Task<User?> GetWithRolesAndDepartmentAsync(int userId);
        Task<User> CreateUserAsync(string firstName, string lastName, string Email, string passwordHash, int departmentId, ClaimsPrincipal user);

        // Admin-only methods
        Task<IEnumerable<User>> GetAllUsersAsync(); // Admin only
        Task<IEnumerable<User>> GetUsersByDepartmentAsync(int departmentId, ClaimsPrincipal user);
        Task<IEnumerable<User>> GetUsersByRoleAsync(int roleId, ClaimsPrincipal user);
        
        // Evaluator-specific methods
        Task<IEnumerable<User>> GetMyTeamMembersAsync(int evaluatorId);
        Task<bool> IsMyTeamMemberAsync(int evaluatorId, int employeeId);
        
        // Employee-specific methods
        Task<User?> GetMyProfileAsync(int userId);
    }
}