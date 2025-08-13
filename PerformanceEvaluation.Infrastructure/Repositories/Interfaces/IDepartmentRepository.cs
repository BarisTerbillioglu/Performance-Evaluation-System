using System.Security.Claims;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Enums;
using PerformanceEvaluation.Core.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Interfaces
{
    public interface IDepartmentRepository : ISecureRepository<Department>
    {
        Task<IEnumerable<Department>> GetAllDepartmentsAsync(); // Admin only
        Task<Department?> GetMyDepartmentAsync(int userId);
        Task<IEnumerable<User>> GetDepartmentUsersAsync(int departmentId, ClaimsPrincipal user);
    }
}