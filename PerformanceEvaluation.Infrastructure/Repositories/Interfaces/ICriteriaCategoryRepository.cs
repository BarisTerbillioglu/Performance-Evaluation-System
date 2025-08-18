using System.Security.Claims;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Interfaces
{
    public interface ICriteriaCategoryRepository : ISecureRepository<CriteriaCategory>
    {
        Task<IEnumerable<CriteriaCategory>> GetAllCategoriesAsync(); // Admin only
        Task<IEnumerable<CriteriaCategory>> GetActiveCategoriesAsync();
        Task<CriteriaCategory?> GetCategoryWithCriteriaAsync(int categoryId);
        Task<bool> ValidateWeightsAsync();
        Task<decimal> GetTotalWeightAsync();
    }
}