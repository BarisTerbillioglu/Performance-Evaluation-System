using System.Security.Claims;

namespace PerformanceEvaluation.Core.Interfaces
{
    public interface ISecureRepository<T> : IBaseRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync(ClaimsPrincipal user);
        Task<T?> GetByIdAsync(int id, ClaimsPrincipal user);
        Task<bool> CanAccessAsync(int id, ClaimsPrincipal user);
    }
}
