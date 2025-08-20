using System.Security.Claims;
using PerformanceEvaluation.Application.DTOs.Criteria;
using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface ICriteriaService
    {
        Task<CriteriaDto> CreateCriteriaAsync(CreateCriteriaRequest request, ClaimsPrincipal user);
        Task<CriteriaDto?> UpdateCriteriaAsync(int id, UpdateCriteriaRequest request, ClaimsPrincipal user);
        Task<bool> CascadeDeactivateCriteriaAsync(int id, ClaimsPrincipal user);
        Task<bool> ReactivateCriteriaAsync(int id, ClaimsPrincipal user);
        Task<bool> DeactivateCriteriaAsync(int id, ClaimsPrincipal user);
        Task<bool> DeleteCriteriaAsync(int id, ClaimsPrincipal user);
        Task<IEnumerable<CriteriaDto>> GetAllCriteriaAsync(ClaimsPrincipal user);
        Task<CriteriaDto?> GetCriteriaByIdAsync(int id, ClaimsPrincipal user);
        Task<IEnumerable<CriteriaDto>> GetCriteriaByCategoryAsync(int categoryId, ClaimsPrincipal user);
        Task<IEnumerable<CriteriaDto>> GetCriteriaForRoleAsync(SystemRole systemRole, JobRoleType jobRole, ClaimsPrincipal user);
        Task<CriteriaWithRoleDescriptionDto?> GetCriteriaWithRoleDescriptionAsync(int criteriaId, int roleId, ClaimsPrincipal user);
        Task<CriteriaRoleDescriptionDto> AddRoleDescriptionAsync(AddRoleDescriptionRequest request, ClaimsPrincipal user);
        Task<CriteriaRoleDescriptionDto?> UpdateRoleDescriptionAsync(int id, UpdateRoleDescriptionRequest request, ClaimsPrincipal user);
        Task<bool> DeleteRoleDescriptionAsync(int id, ClaimsPrincipal user);
        Task<IEnumerable<CriteriaDto>> GetActiveCriteriaForEvaluationAsync();
    }
}