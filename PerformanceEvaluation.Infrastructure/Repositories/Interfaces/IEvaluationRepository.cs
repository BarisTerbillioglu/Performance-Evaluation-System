using System.Security.Claims;
using Microsoft.EntityFrameworkCore.Storage;
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
        Task<Evaluation?> GetEvaluationForSummaryAsync(int evaluationId, ClaimsPrincipal user);
        Task<IEnumerable<Evaluation>> GetRecentEvaluationsAsync(ClaimsPrincipal user, int limit = 10);
        Task<Dictionary<string, int>> GetEvaluationCountsByStatusAsync(ClaimsPrincipal user);
        Task<bool> IsEvaluationEditableAsync(int evaluationId, ClaimsPrincipal user);
        Task<Evaluation?> UpdateBasicInfoAsync(int evaluationId, string? period, DateTime? startDate, DateTime? endDate, string? generalComments, ClaimsPrincipal user);
        Task<Evaluation> CreateEvaluationAsync(int employeeId, string period, DateTime startDate, DateTime endDate, ClaimsPrincipal user);
        Task<Evaluation?> GetEvaluationWithScoresAsync(int evaluationId, ClaimsPrincipal user);
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<bool> UpdateTotalScoreAsync(int evaluationId, decimal totalScore);

    }
}