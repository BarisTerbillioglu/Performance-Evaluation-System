using Microsoft.Extensions.Diagnostics.HealthChecks;
using PerformanceEvaluation.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace PerformanceEvaluation.API.HealthChecks
{
    /// <summary>
    /// Health check to verify database connectivity and basic functionality
    /// </summary>
    public class DatabaseHealthCheck : IHealthCheck
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DatabaseHealthCheck> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="context"></param>
        /// <param name="logger"></param>
        public DatabaseHealthCheck(ApplicationDbContext context, ILogger<DatabaseHealthCheck> logger)
        {
            _context = context;
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
            try
            {
                // Test basic connectivity
                await _context.Database.CanConnectAsync(cancellationToken);

                // Test a simple query to verify read operations
                var userCount = await _context.Users.CountAsync(cancellationToken);
                var departmentCount = await _context.Departments.CountAsync(cancellationToken);

                var data = new Dictionary<string, object>
                {
                    ["UsersCount"] = userCount,
                    ["DepartmentsCount"] = departmentCount,
                    ["ConnectionString"] = _context.Database.GetConnectionString()?.Substring(0, 20) + "...",
                    ["DatabaseProvider"] = _context.Database.ProviderName,
                    ["LastChecked"] = DateTime.UtcNow
                };

                _logger.LogInformation("Database health check passed. Users: {UserCount}, Departments: {DepartmentCount}",
                    userCount, departmentCount);

                return HealthCheckResult.Healthy(
                    "Database is accessible and operational",
                    data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database health check failed");

                return HealthCheckResult.Unhealthy(
                    "Database connectivity issues detected",
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