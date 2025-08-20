using System.Security.Claims;
using PerformanceEvaluation.Application.DTOs.CriteriaCategory;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface ICriteriaCategoryService
    {
        Task<CriteriaCategoryDto> CreateCategoryAsync(CreateCriteriaCategoryRequest request, ClaimsPrincipal user);
        Task<CriteriaCategoryDto?> UpdateCategoryAsync(int id, UpdateCriteriaCategoryRequest request, ClaimsPrincipal user);
        Task<bool> DeactivateCriteriaCategoryAsync(int id, ClaimsPrincipal user);
        Task<bool> ReactivateCriteriaCategoryAsync(int id, ClaimsPrincipal user);
        Task<bool> CascadeDeactivateCriteriaCategoryAsync(int id, ClaimsPrincipal user);
        Task<bool> DeleteCriteriaCategoryAsync(int id, ClaimsPrincipal user);
        Task<IEnumerable<CriteriaCategoryDto>> GetAllCategoriesAsync(ClaimsPrincipal user);
        Task<CriteriaCategoryDto?> GetCategoryByIdAsync(int id, ClaimsPrincipal user);
        Task<CriteriaCategoryWithCriteriaDto?> GetCategoryWithCriteriaAsync(int id, ClaimsPrincipal user);
        Task<IEnumerable<CriteriaCategoryDto>> GetActiveCategoriesAsync();
        Task<WeightValidationDto> ValidateWeightsAsync(ClaimsPrincipal user);
        Task<bool> RebalanceWeightsAsync(List<RebalanceWeightRequest> requests, ClaimsPrincipal user);
    }
}
