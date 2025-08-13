using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Enums;
using PerformanceEvaluation.Core.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Interfaces
{
    public interface ICriteriaRepository : ISecureRepository<Criteria>
    {
       // Admin methods
        Task<IEnumerable<Criteria>> GetAllCriteriaAsync(); // Admin only
        Task<IEnumerable<Criteria>> GetCriteriaByCategoryAsync(int categoryId);
        
        // Role-specific criteria retrieval
        Task<IEnumerable<Criteria>> GetCriteriaForRoleAsync(SystemRole systemRole, JobRoleType jobRole);
        Task<Criteria?> GetCriteriaWithRoleDescriptionAsync(int criteriaId, int roleId);
        
        // Evaluation-specific
        Task<IEnumerable<Criteria>> GetActiveCriteriaForEvaluationAsync();
    }
}