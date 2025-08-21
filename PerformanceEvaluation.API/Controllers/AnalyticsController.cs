using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.Search;
using PerformanceEvaluation.Application.Services.Interfaces;

namespace PerformanceEvaluation.API.Controllers
{
    /// <summary>
    /// Controller for analytics and reporting functionality
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ISearchService _searchService;
        private readonly IEvaluationService _evaluationService;
        private readonly ICriteriaCategoryService _categoryService;
        private readonly IUserService _userService;
        private readonly ILogger<AnalyticsController> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="searchService"></param>
        /// <param name="evaluationService"></param>
        /// <param name="categoryService"></param>
        /// <param name="userService"></param>
        /// <param name="logger"></param>
        public AnalyticsController(
            ISearchService searchService,
            IEvaluationService evaluationService,
            ICriteriaCategoryService categoryService,
            IUserService userService,
            ILogger<AnalyticsController> logger)
        {
            _searchService = searchService;
            _evaluationService = evaluationService;
            _categoryService = categoryService;
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// Get advanced analytics data
        /// </summary>
        /// <param name="request">Analytics request parameters</param>
        /// <returns>Advanced analytics data with charts and metrics</returns>
        [HttpPost("advanced")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> GetAdvancedAnalytics([FromBody] AnalyticsRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _searchService.GetAdvancedAnalyticsAsync(request, User);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving advanced analytics");
                return StatusCode(500, new { message = "Error retrieving analytics data" });
            }
        }

        /// <summary>
        /// Get performance trends over time
        /// </summary>
        /// <param name="departmentId">Optional department filter</param>
        /// <param name="startDate">Start date for analysis</param>
        /// <param name="endDate">End date for analysis</param>
        /// <param name="groupBy">Grouping period (month, quarter, year)</param>
        /// <returns>Performance trend data</returns>
        [HttpGet("performance-trends")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> GetPerformanceTrends(
            [FromQuery] int? departmentId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string groupBy = "month")
        {
            try
            {
                var request = new AnalyticsRequest
                {
                    StartDate = startDate ?? DateTime.UtcNow.AddMonths(-12),
                    EndDate = endDate ?? DateTime.UtcNow,
                    DepartmentIds = departmentId.HasValue ? new List<int> { departmentId.Value } : new List<int>(),
                    GroupBy = groupBy,
                    MetricTypes = new List<string> { "performance", "completion", "scores" },
                    IncludeComparisons = true
                };

                var result = await _searchService.GetAdvancedAnalyticsAsync(request, User);
                
                return Ok(new
                {
                    trends = result.ChartData,
                    metrics = result.Metrics,
                    comparisons = result.Comparisons,
                    period = result.Period,
                    generatedAt = result.GeneratedAt
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving performance trends");
                return StatusCode(500, new { message = "Error retrieving performance trends" });
            }
        }

        /// <summary>
        /// Get department comparison analytics
        /// </summary>
        /// <param name="startDate">Start date for comparison</param>
        /// <param name="endDate">End date for comparison</param>
        /// <returns>Department comparison data</returns>
        [HttpGet("department-comparison")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> GetDepartmentComparison(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userRole = User.FindFirst("Role")?.Value;
                if (userRole != "Admin")
                {
                    return Forbid("Only administrators can access department comparison analytics");
                }

                var request = new AnalyticsRequest
                {
                    StartDate = startDate ?? DateTime.UtcNow.AddMonths(-6),
                    EndDate = endDate ?? DateTime.UtcNow,
                    GroupBy = "department",
                    MetricTypes = new List<string> { "completion", "scores", "participation" },
                    IncludeComparisons = true
                };

                var result = await _searchService.GetAdvancedAnalyticsAsync(request, User);
                
                return Ok(new
                {
                    departmentData = result.ChartData,
                    overallMetrics = result.Metrics,
                    comparisons = result.Comparisons,
                    generatedAt = result.GeneratedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving department comparison");
                return StatusCode(500, new { message = "Error retrieving department comparison" });
            }
        }

        /// <summary>
        /// Get evaluation completion metrics
        /// </summary>
        /// <param name="departmentId">Optional department filter</param>
        /// <param name="period">Time period (week, month, quarter, year)</param>
        /// <returns>Completion metrics and trends</returns>
        [HttpGet("completion-metrics")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> GetCompletionMetrics(
            [FromQuery] int? departmentId = null,
            [FromQuery] string period = "month")
        {
            try
            {
                var (startDate, endDate) = GetDateRangeForPeriod(period);
                
                var request = new AnalyticsRequest
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    DepartmentIds = departmentId.HasValue ? new List<int> { departmentId.Value } : new List<int>(),
                    GroupBy = period,
                    MetricTypes = new List<string> { "completion", "timeline", "overdue" }
                };

                var result = await _searchService.GetAdvancedAnalyticsAsync(request, User);
                
                // Calculate additional completion metrics
                var completionRate = result.Metrics.ContainsKey("CompletionRate") ? 
                    (decimal)result.Metrics["CompletionRate"] : 0;
                
                var onTimeRate = CalculateOnTimeCompletionRate(departmentId, startDate, endDate);
                
                return Ok(new
                {
                    completionRate = completionRate,
                    onTimeRate = await onTimeRate,
                    trends = result.ChartData,
                    metrics = result.Metrics,
                    period = period,
                    generatedAt = result.GeneratedAt
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving completion metrics");
                return StatusCode(500, new { message = "Error retrieving completion metrics" });
            }
        }

        /// <summary>
        /// Get score distribution analytics
        /// </summary>
        /// <param name="departmentId">Optional department filter</param>
        /// <param name="criteriaId">Optional criteria filter</param>
        /// <param name="startDate">Start date for analysis</param>
        /// <param name="endDate">End date for analysis</param>
        /// <returns>Score distribution data</returns>
        [HttpGet("score-distribution")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> GetScoreDistribution(
            [FromQuery] int? departmentId = null,
            [FromQuery] int? criteriaId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var request = new AnalyticsRequest
                {
                    StartDate = startDate ?? DateTime.UtcNow.AddMonths(-6),
                    EndDate = endDate ?? DateTime.UtcNow,
                    DepartmentIds = departmentId.HasValue ? new List<int> { departmentId.Value } : new List<int>(),
                    MetricTypes = new List<string> { "scores", "distribution", "percentiles" }
                };

                var result = await _searchService.GetAdvancedAnalyticsAsync(request, User);
                
                // Calculate score distribution buckets
                var scoreDistribution = CalculateScoreDistribution(departmentId, criteriaId, startDate, endDate);
                
                return Ok(new
                {
                    distribution = await scoreDistribution,
                    averageScore = result.Metrics.ContainsKey("AverageScore") ? result.Metrics["AverageScore"] : 0,
                    metrics = result.Metrics,
                    trends = result.ChartData,
                    generatedAt = result.GeneratedAt
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving score distribution");
                return StatusCode(500, new { message = "Error retrieving score distribution" });
            }
        }

        /// <summary>
        /// Get top performers analysis
        /// </summary>
        /// <param name="departmentId">Optional department filter</param>
        /// <param name="period">Time period for analysis</param>
        /// <param name="limit">Number of top performers to return</param>
        /// <returns>Top performers data</returns>
        [HttpGet("top-performers")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> GetTopPerformers(
            [FromQuery] int? departmentId = null,
            [FromQuery] string period = "quarter",
            [FromQuery] int limit = 10)
        {
            try
            {
                var (startDate, endDate) = GetDateRangeForPeriod(period);
                
                var topPerformers = await CalculateTopPerformers(departmentId, startDate, endDate, limit);
                
                return Ok(new
                {
                    topPerformers = topPerformers,
                    period = period,
                    limit = limit,
                    departmentId = departmentId,
                    generatedAt = DateTime.UtcNow
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top performers");
                return StatusCode(500, new { message = "Error retrieving top performers" });
            }
        }

        /// <summary>
        /// Get system usage analytics (Admin only)
        /// </summary>
        /// <param name="startDate">Start date for analysis</param>
        /// <param name="endDate">End date for analysis</param>
        /// <returns>System usage metrics</returns>
        [HttpGet("system-usage")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetSystemUsage(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var usage = await CalculateSystemUsage(
                    startDate ?? DateTime.UtcNow.AddMonths(-3),
                    endDate ?? DateTime.UtcNow);
                
                return Ok(usage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system usage analytics");
                return StatusCode(500, new { message = "Error retrieving system usage" });
            }
        }

        /// <summary>
        /// Export analytics data to Excel
        /// </summary>
        /// <param name="request">Analytics request parameters</param>
        /// <returns>Excel file with analytics data</returns>
        [HttpPost("export")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> ExportAnalytics([FromBody] AnalyticsRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // This would typically use a service to generate Excel files
                // For now, return analytics data in JSON format
                var result = await _searchService.GetAdvancedAnalyticsAsync(request, User);
                
                var exportData = new
                {
                    ExportDate = DateTime.UtcNow,
                    Parameters = request,
                    Analytics = result
                };

                return Ok(new
                {
                    message = "Analytics data prepared for export",
                    data = exportData,
                    downloadUrl = "/api/analytics/download-export", // Would be implemented separately
                    fileName = $"analytics-export-{DateTime.UtcNow:yyyyMMdd-HHmmss}.json"
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting analytics data");
                return StatusCode(500, new { message = "Error exporting analytics data" });
            }
        }

        // Helper methods
        private (DateTime startDate, DateTime endDate) GetDateRangeForPeriod(string period)
        {
            var endDate = DateTime.UtcNow;
            var startDate = period.ToLower() switch
            {
                "week" => endDate.AddDays(-7),
                "month" => endDate.AddMonths(-1),
                "quarter" => endDate.AddMonths(-3),
                "year" => endDate.AddYears(-1),
                _ => endDate.AddMonths(-1)
            };

            return (startDate, endDate);
        }

        private async Task<decimal> CalculateOnTimeCompletionRate(int? departmentId, DateTime startDate, DateTime endDate)
        {
            // This would calculate the percentage of evaluations completed on time
            // Implementation would depend on how "on time" is defined in your business rules
            await Task.CompletedTask; // Placeholder for async operation
            return 85.5m; // Example return value
        }

        private async Task<object> CalculateScoreDistribution(int? departmentId, int? criteriaId, DateTime? startDate, DateTime? endDate)
        {
            // This would calculate score distribution across different ranges
            await Task.CompletedTask; // Placeholder for async operation
            
            return new
            {
                ranges = new[]
                {
                    new { range = "90-100", count = 25, percentage = 25.0 },
                    new { range = "80-89", count = 35, percentage = 35.0 },
                    new { range = "70-79", count = 30, percentage = 30.0 },
                    new { range = "60-69", count = 8, percentage = 8.0 },
                    new { range = "0-59", count = 2, percentage = 2.0 }
                },
                total = 100
            };
        }

        private async Task<object> CalculateTopPerformers(int? departmentId, DateTime startDate, DateTime endDate, int limit)
        {
            // This would calculate top performers based on evaluation scores
            await Task.CompletedTask; // Placeholder for async operation
            
            return new
            {
                performers = new[]
                {
                    new { name = "John Doe", department = "Engineering", averageScore = 95.5, evaluationCount = 3 },
                    new { name = "Jane Smith", department = "Marketing", averageScore = 92.8, evaluationCount = 2 },
                    new { name = "Bob Johnson", department = "Sales", averageScore = 90.2, evaluationCount = 4 }
                }.Take(limit)
            };
        }

        private async Task<object> CalculateSystemUsage(DateTime startDate, DateTime endDate)
        {
            // This would calculate various system usage metrics
            await Task.CompletedTask; // Placeholder for async operation
            
            return new
            {
                totalLogins = 1250,
                uniqueActiveUsers = 85,
                evaluationsCreated = 145,
                evaluationsCompleted = 120,
                avgSessionDuration = "15.5 minutes",
                peakUsageHours = new[] { "9-10 AM", "2-3 PM", "4-5 PM" },
                featureUsage = new
                {
                    dashboard = 95,
                    evaluations = 88,
                    reports = 62,
                    userManagement = 25,
                    analytics = 15
                },
                period = $"{startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}"
            };
        }
    }
}