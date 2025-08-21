using Microsoft.AspNetCore.Http;
using PerformanceEvaluation.Application.DTOs.BulkOperations;
using System.Security.Claims;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface IBulkOperationService
    {
        Task<BulkImportResultDto> ImportUsersAsync(IFormFile file, ClaimsPrincipal user);
        Task<BulkImportResultDto> ImportEvaluationsAsync(IFormFile file, ClaimsPrincipal user);
        Task<BulkOperationResultDto> BulkUpdateUserStatusAsync(BulkUpdateStatusRequest request, ClaimsPrincipal user);
        Task<BulkOperationResultDto> BulkAssignEvaluatorsAsync(BulkAssignEvaluatorsRequest request, ClaimsPrincipal user);
        Task<BulkOperationResultDto> BulkCreateEvaluationsAsync(BulkCreateEvaluationsRequest request, ClaimsPrincipal user);
        Task<byte[]> GenerateUserImportTemplateAsync();
        Task<byte[]> GenerateEvaluationImportTemplateAsync();
        Task<List<string>> ValidateImportFileAsync(IFormFile file, string importType);
        Task<object> GetImportPreviewAsync(IFormFile file, string importType);
    }
}