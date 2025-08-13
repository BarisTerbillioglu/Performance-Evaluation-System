using System.Security.Claims;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Enums;
using PerformanceEvaluation.Core.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Interfaces
{
    public interface IEvaluationRepository : ISecureRepository<Evaluation>
    {
        Task<IEnumerable<Evaluation>> GetAllEvaluationsAsync(); // Admin only
        Task<IEnumerable<Evaluation>> GetEvaluationsByDepartmentAsync(int departmentId);
        Task<IEnumerable<Evaluation>> GetEvaluationsByPeriodAsync(string period, ClaimsPrincipal user);
        
        // Evaluator methods
        Task<IEnumerable<Evaluation>> GetMyEvaluationsAsync(int evaluatorId);
        Task<IEnumerable<Evaluation>> GetTeamEvaluationsAsync(int evaluatorId);
        Task<bool> CanEvaluateEmployeeAsync(int evaluatorId, int employeeId);
        
        // Employee methods
        Task<IEnumerable<Evaluation>> GetMyPerformanceHistoryAsync(int employeeId);
        Task<Evaluation?> GetMyEvaluationDetailsAsync(int evaluationId, int employeeId);
        
        // Status and workflow methods
        Task<IEnumerable<Evaluation>> GetEvaluationsByStatusAsync(EvaluationStatus status, ClaimsPrincipal user);
        Task<bool> UpdateEvaluationStatusAsync(int evaluationId, EvaluationStatus status, ClaimsPrincipal user);
    }
}