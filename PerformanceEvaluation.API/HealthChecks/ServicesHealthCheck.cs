using Microsoft.Extensions.Diagnostics.HealthChecks;
using PerformanceEvaluation.Application.Services.Interfaces;

namespace PerformanceEvaluation.API.HealthChecks
{
    /// <summary>
    /// Health check to verify application services are functioning properly
    /// </summary>
    public class ServicesHealthCheck : IHealthCheck
    {
        private readonly ICriteriaCategoryService _categoryService;
        private readonly IUserService _userService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<ServicesHealthCheck> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="categoryService"></param>
        /// <param name="userService"></param>
        /// <param name="notificationService"></param>
        /// <param name="logger"></param>
        public ServicesHealthCheck(
            ICriteriaCategoryService categoryService,
            IUserService userService,
            INotificationService notificationService,
            ILogger<ServicesHealthCheck> logger)
        {
            _categoryService = categoryService;
            _userService = userService;
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="context"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            var issues = new List<string>();
            var data = new Dictionary<string, object>();

            try
            {
                // Check category weights validation
                var weightValidation = await _categoryService.ValidateWeightsAsync(
                    new System.Security.Claims.ClaimsPrincipal()); // System check

                if (!weightValidation.IsValid)
                {
                    issues.Add($"Category weights validation failed: Total weight is {weightValidation.TotalWeight}%, should be 100%");
                }

                data["WeightsValid"] = weightValidation.IsValid;
                data["TotalWeight"] = weightValidation.TotalWeight;

                // Check if there are active categories
                var categories = await _categoryService.GetActiveCategoriesAsync();
                var activeCategoriesCount = categories.Count();

                if (activeCategoriesCount == 0)
                {
                    issues.Add("No active criteria categories found");
                }

                data["ActiveCategoriesCount"] = activeCategoriesCount;

                // Check notification service health (basic test)
                try
                {
                    var notificationCount = await _notificationService.GetUnreadNotificationCountAsync(1); // Test user
                    data["NotificationServiceOperational"] = true;
                }
                catch
                {
                    issues.Add("Notification service is not responding properly");
                    data["NotificationServiceOperational"] = false;
                }

                data["LastChecked"] = DateTime.UtcNow;
                data["IssuesCount"] = issues.Count;

                if (issues.Any())
                {
                    _logger.LogWarning("Services health check found issues: {Issues}", string.Join("; ", issues));

                    return HealthCheckResult.Degraded(
                        $"Services operational but {issues.Count} issue(s) detected: {string.Join("; ", issues)}",
                        data: data);
                }

                _logger.LogInformation("Services health check passed");

                return HealthCheckResult.Healthy(
                    "All application services are operational",
                    data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Services health check failed");

                return HealthCheckResult.Unhealthy(
                    "Critical failure in application services",
                    ex,
                    new Dictionary<string, object>
                    {
                        ["Error"] = ex.Message,
                        ["LastChecked"] = DateTime.UtcNow
                    });
            }
        }
    }
}