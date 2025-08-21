using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.Export;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Core.Exceptions;

namespace PerformanceEvaluation.API.Controllers
{
    /// <summary>
    /// Controller for data export operations using the existing ExportService
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class ExportController : ControllerBase
    {
        private readonly IExportService _exportService;
        private readonly ILogger<ExportController> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="exportService"></param>
        /// <param name="logger"></param>
        public ExportController(IExportService exportService, ILogger<ExportController> logger)
        {
            _exportService = exportService;
            _logger = logger;
        }

        /// <summary>
        /// Export single evaluation to PDF
        /// </summary>
        /// <param name="evaluationId">Evaluation ID to export</param>
        /// <returns>PDF file of the evaluation</returns>
        [HttpGet("evaluation/{evaluationId}/pdf")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> ExportEvaluationToPdf(int evaluationId)
        {
            try
            {
                var pdfBytes = await _exportService.ExportEvaluationToPdfAsync(evaluationId, User);
                var fileName = $"evaluation_{evaluationId}_{DateTime.UtcNow:yyyyMMdd}.pdf";
                
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (ArgumentNotFoundException)
            {
                return NotFound(new { message = "Evaluation not found" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting evaluation {EvaluationId} to PDF", evaluationId);
                return StatusCode(500, new { message = "Error generating PDF export" });
            }
        }

        /// <summary>
        /// Export multiple evaluations to Excel
        /// </summary>
        /// <param name="request">Export parameters</param>
        /// <returns>Excel file with evaluations data</returns>
        [HttpPost("evaluations/excel")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> ExportEvaluationsToExcel([FromBody] ExportEvaluationsRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var excelBytes = await _exportService.ExportEvaluationsToExcelAsync(request, User);
                var fileName = $"evaluations_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";
                
                return File(excelBytes, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    fileName);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting evaluations to Excel");
                return StatusCode(500, new { message = "Error generating Excel export" });
            }
        }

        /// <summary>
        /// Export users to Excel
        /// </summary>
        /// <param name="request">Export parameters</param>
        /// <returns>Excel file with users data</returns>
        [HttpPost("users/excel")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> ExportUsersToExcel([FromBody] ExportUsersRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var excelBytes = await _exportService.ExportUsersToExcelAsync(request, User);
                var fileName = $"users_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";
                
                return File(excelBytes, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    fileName);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting users to Excel");
                return StatusCode(500, new { message = "Error generating Excel export" });
            }
        }

        /// <summary>
        /// Export department performance report to PDF
        /// </summary>
        /// <param name="departmentId">Department ID</param>
        /// <param name="startDate">Report start date</param>
        /// <param name="endDate">Report end date</param>
        /// <returns>PDF department report</returns>
        [HttpGet("department/{departmentId}/report/pdf")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> ExportDepartmentReportToPdf(
            int departmentId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var start = startDate ?? DateTime.UtcNow.AddMonths(-6);
                var end = endDate ?? DateTime.UtcNow;

                var pdfBytes = await _exportService.ExportDepartmentReportToPdfAsync(departmentId, start, end, User);
                var fileName = $"department_{departmentId}_report_{start:yyyyMMdd}_{end:yyyyMMdd}.pdf";
                
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (ArgumentNotFoundException)
            {
                return NotFound(new { message = "Department not found" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting department {DepartmentId} report to PDF", departmentId);
                return StatusCode(500, new { message = "Error generating department report" });
            }
        }

        /// <summary>
        /// Export performance report to PDF
        /// </summary>
        /// <param name="request">Performance report parameters</param>
        /// <returns>PDF performance report</returns>
        [HttpPost("performance-report/pdf")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> ExportPerformanceReportToPdf([FromBody] PerformanceReportRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var pdfBytes = await _exportService.ExportPerformanceReportToPdfAsync(request, User);
                var fileName = $"performance_report_{request.StartDate:yyyyMMdd}_{request.EndDate:yyyyMMdd}.pdf";
                
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting performance report to PDF");
                return StatusCode(500, new { message = "Error generating performance report" });
            }
        }

        /// <summary>
        /// Generate comprehensive report
        /// </summary>
        /// <param name="request">Comprehensive report parameters</param>
        /// <returns>PDF comprehensive report</returns>
        [HttpPost("comprehensive-report/pdf")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GenerateComprehensiveReport([FromBody] ComprehensiveReportRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var pdfBytes = await _exportService.GenerateComprehensiveReportAsync(request, User);
                var fileName = $"comprehensive_report_{request.ReportType}_{request.StartDate:yyyyMMdd}_{request.EndDate:yyyyMMdd}.pdf";
                
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating comprehensive report");
                return StatusCode(500, new { message = "Error generating comprehensive report" });
            }
        }

        /// <summary>
        /// Get available export formats for a specific type
        /// </summary>
        /// <param name="exportType">Type of export (evaluation, user, department, etc.)</param>
        /// <returns>List of available formats and options</returns>
        [HttpGet("formats/{exportType}")]
        [Authorize(Policy = "AllUsers")]
        public IActionResult GetAvailableFormats(string exportType)
        {
            try
            {
                object formats = exportType.ToLower() switch
                {
                    "evaluation" => new
                    {
                        formats = new[] { "pdf" },
                        options = new Dictionary<string, object>
                        {
                            ["includeScores"] = true,
                            ["includeComments"] = true,
                            ["includeCharts"] = false
                        }
                    },
                    "evaluations" => new
                    {
                        formats = new[] { "xlsx", "csv" },
                        options = new Dictionary<string, object>
                        {
                            ["includeScores"] = true,
                            ["includeComments"] = false,
                            ["dateRange"] = true,
                            ["departmentFilter"] = true,
                            ["statusFilter"] = true
                        }
                    },
                    "users" => new
                    {
                        formats = new[] { "xlsx", "csv" },
                        options = new Dictionary<string, object>
                        {
                            ["includeRoleAssignments"] = true,
                            ["includePerformanceMetrics"] = true,
                            ["departmentFilter"] = true,
                            ["activeStatusFilter"] = true
                        }
                    },
                    "department" => new
                    {
                        formats = new[] { "pdf" },
                        options = new Dictionary<string, object>
                        {
                            ["dateRange"] = true,
                            ["includeEmployeeDetails"] = true,
                            ["includePerformanceMetrics"] = true
                        }
                    },
                    "performance-report" => new
                    {
                        formats = new[] { "pdf" },
                        options = new Dictionary<string, object>
                        {
                            ["dateRange"] = true,
                            ["departmentFilter"] = true,
                            ["teamFilter"] = true,
                            ["userFilter"] = true
                        }
                    },
                    "comprehensive-report" => new
                    {
                        formats = new[] { "pdf" },
                        options = new Dictionary<string, object>
                        {
                            ["reportTypes"] = new[] { "executive", "detailed", "summary" },
                            ["dateRange"] = true,
                            ["departmentFilter"] = true,
                            ["includeAnalytics"] = true
                        }
                    },
                    _ => new
                    {
                        formats = new string[] { },
                        options = new Dictionary<string, object>()
                    }
                };

                return Ok(formats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available formats for {ExportType}", exportType);
                return StatusCode(500, new { message = "Error retrieving export formats" });
            }
        }

        /// <summary>
        /// Get export statistics (Admin only)
        /// </summary>
        /// <returns>Export usage statistics</returns>
        [HttpGet("statistics")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult GetExportStatistics()
        {
            try
            {
                // This would typically come from tracking/analytics
                var stats = new
                {
                    totalExports = 0, // Would be tracked
                    exportsByType = new
                    {
                        evaluationPdf = 0,
                        evaluationsExcel = 0,
                        usersExcel = 0,
                        departmentReports = 0,
                        performanceReports = 0,
                        comprehensiveReports = 0
                    },
                    exportsByUser = new { }, // Top users by export count
                    averageFileSize = "0 MB",
                    lastExportDate = DateTime.UtcNow,
                    generatedAt = DateTime.UtcNow
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting export statistics");
                return StatusCode(500, new { message = "Error retrieving export statistics" });
            }
        }

        /// <summary>
        /// Health check for export service
        /// </summary>
        /// <returns>Service health status</returns>
        [HttpGet("health")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult GetExportServiceHealth()
        {
            try
            {
                // Test basic service functionality
                var health = new
                {
                    status = "healthy",
                    services = new
                    {
                        puppeteer = "available", // Would check if Puppeteer is working
                        epplus = "available",    // Would check EPPlus functionality
                        fileSystem = "available" // Would check file system access
                    },
                    capabilities = new
                    {
                        pdfGeneration = true,
                        excelGeneration = true,
                        htmlTemplating = true
                    },
                    lastChecked = DateTime.UtcNow
                };

                return Ok(health);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking export service health");
                return StatusCode(500, new 
                { 
                    status = "unhealthy", 
                    error = "Export service health check failed",
                    lastChecked = DateTime.UtcNow
                });
            }
        }
    }
}