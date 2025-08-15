using PerformanceEvaluation.Core.Entities;
using System.Security.Claims;
using PerformanceEvaluation.Application.DTOs.Evaluation;
using PerformanceEvaluation.Application.DTOs.EvaluationScore;
using PerformanceEvaluation.Application.DTOs.Comment;
using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface IEvaluationService
    {
        Task<EvaluationDto> CreateEvaluationAsync(CreateEvaluationRequest request, ClaimsPrincipal user);
        Task<EvaluationFormDto?> GetEvaluationFormAsync(int evaluationId, ClaimsPrincipal user);
        Task<EvaluationSummaryDto?> GetEvaluationSummaryAsync(int evaluationId, ClaimsPrincipal user);
        Task<IEnumerable<EvaluationListDto>> GetEvaluationListAsync(ClaimsPrincipal user);
        Task<EvaluationScoreDto> UpdateScoreAsync(UpdateScoreRequest request, ClaimsPrincipal user);
        Task<bool> UpdateEvaluationAsync(UpdateEvaluationRequest request, ClaimsPrincipal user);
        Task<CommentDto> AddCommentToScoreAsync(AddCommentRequest request, ClaimsPrincipal user);
        Task<CommentDto?> UpdateCommentAsync(UpdateCommentRequest request, ClaimsPrincipal user);
        Task<IEnumerable<CommentDto>> GetCommentsForScoreAsync(int evaluationId, int criteriaId, ClaimsPrincipal user);
        Task<IEnumerable<EvaluationListDto>> GetEvaluationsByStatusAsync(EvaluationStatus status, ClaimsPrincipal user);
        Task<IEnumerable<EvaluationListDto>> GetEvaluationsByPeriodAsync(string period, ClaimsPrincipal user);
        Task<IEnumerable<EvaluationListDto>> GetRecentEvaluationsAsync(ClaimsPrincipal user, int limit = 10);
        Task<EvaluationDashboardDto> GetDashboardDataAsync(ClaimsPrincipal user);
        Task<bool> DeleteEvaluationAsync(int evaluationId, ClaimsPrincipal user);
        Task<bool> SubmitEvaluationAsync(int evaluationId, ClaimsPrincipal user);
        Task<IEnumerable<Evaluation>> GetEvaluationsAsync(ClaimsPrincipal user);
        Task<Evaluation?> GetEvaluationDetailsAsync(int evaluationId, ClaimsPrincipal user);
    }
}