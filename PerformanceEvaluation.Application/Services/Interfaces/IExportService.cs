using PerformanceEvaluation.Application.DTOs.Export;
using System.Security.Claims;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface IExportService
    {
        Task<byte[]> ExportEvaluationToPdfAsync(int evaluationId, ClaimsPrincipal user);
        Task<byte[]> ExportEvaluationsToExcelAsync(ExportEvaluationsRequest request, ClaimsPrincipal user);
        Task<byte[]> ExportUsersToExcelAsync(ExportUsersRequest request, ClaimsPrincipal user);
        Task<byte[]> ExportDepartmentReportToPdfAsync(int departmentId, DateTime startDate, DateTime endDate, ClaimsPrincipal user);
        Task<byte[]> ExportPerformanceReportToPdfAsync(PerformanceReportRequest request, ClaimsPrincipal user);
        Task<byte[]> GenerateComprehensiveReportAsync(ComprehensiveReportRequest request, ClaimsPrincipal user);
    }
}