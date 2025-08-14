using PerformanceEvaluation.Core.Entities;
using System.Security.Claims;
using PerformanceEvaluation.Application.DTOs.Evaluation;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface IEvaluationService
    {
        Task<Evaluation> CreateEvaluationAsync(CreateEvaluationRequest request, ClaimsPrincipal user);
        Task<Evaluation?> UpdateEvaluationAsync(int evaluationId, UpdateEvaluationRequest request, ClaimsPrincipal user);
        Task<bool> DeleteEvaluationAsync(int evaluationId, ClaimsPrincipal user);
        Task<bool> SubmitEvaluationAsync(int evaluationId, ClaimsPrincipal user);
        Task<IEnumerable<Evaluation>> GetEvaluationsAsync(ClaimsPrincipal user);
        Task<Evaluation?> GetEvaluationDetailsAsync(int evaluationId, ClaimsPrincipal user);
    }
}