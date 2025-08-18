using System.Security.Claims;
using PerformanceEvaluation.Application.DTOs.Department;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface IDepartmentService
    {
        Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentRequest request, ClaimsPrincipal user);
        Task<DepartmentDto?> UpdateDepartmentAsync(int id, UpdateDepartmentRequest request, ClaimsPrincipal user);
        Task<bool> DeleteDepartmentAsync(int id, ClaimsPrincipal user);
        Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync(ClaimsPrincipal user);
        Task<DepartmentDto?> GetDepartmentByIdAsync(int id, ClaimsPrincipal user);
        Task<DepartmentWithUsersDto?> GetDepartmentWithUsersAsync(int id, ClaimsPrincipal user);
        Task<DepartmentDto?> GetMyDepartmentAsync(ClaimsPrincipal user);
        Task<DepartmentStatsDto> GetDepartmentStatsAsync(int id, ClaimsPrincipal user);
    }
}