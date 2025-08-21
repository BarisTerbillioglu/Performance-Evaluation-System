using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Diagnostics;
using System.Text.Json;

namespace PerformanceEvaluation.API.Controllers
{
    /// <summary>
    /// Controller for system health monitoring and diagnostics
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class HealthController : ControllerBase
    {
        private readonly HealthCheckService _healthCheckService;
        private readonly ILogger<HealthController> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="healthCheckService"></param>
        /// <param name="logger"></param>
        public HealthController(
            HealthCheckService healthCheckService,
            ILogger<HealthController> logger)
        {
            _healthCheckService = healthCheckService;
            _logger = logger;
        }

        /// <summary>
        /// Get overall system health status
        /// </summary>
        /// <returns>System health information</returns>
        [HttpGet]
        [AllowAnonymous] // This endpoint should be accessible for monitoring tools
        public async Task<IActionResult> GetHealth()
        {
            try
            {
                var healthReport = await _healthCheckService.CheckHealthAsync();
                
                var response = new
                {
                    Status = healthReport.Status.ToString(),
                    TotalDuration = healthReport.TotalDuration.TotalMilliseconds,
                    Timestamp = DateTime.UtcNow,
                    Checks = healthReport.Entries.Select(entry => new
                    {
                        Name = entry.Key,
                        Status = entry.Value.Status.ToString(),
                        Duration = entry.Value.Duration.TotalMilliseconds,
                        Description = entry.Value.Description,
                        Data = entry.Value.Data,
                        Exception = entry.Value.Exception?.Message
                    })
                };

                var statusCode = healthReport.Status switch
                {
                    HealthStatus.Healthy => 200,
                    HealthStatus.Degraded => 200, // Still operational
                    HealthStatus.Unhealthy => 503, // Service unavailable
                    _ => 500
                };

                return StatusCode(statusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking system health");
                return StatusCode(500, new { 
                    Status = "Unhealthy", 
                    Error = "Health check system failure",
                    Message = ex.Message,
                    Timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get detailed health information (Admin only)
        /// </summary>
        /// <returns>Detailed system health information including sensitive data</returns>
        [HttpGet("detailed")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetDetailedHealth()
        {
            try
            {
                var healthReport = await _healthCheckService.CheckHealthAsync();
                
                var response = new
                {
                    Status = healthReport.Status.ToString(),
                    TotalDuration = healthReport.TotalDuration.TotalMilliseconds,
                    Timestamp = DateTime.UtcNow,
                    Environment = new
                    {
                        MachineName = Environment.MachineName,
                        OSVersion = Environment.OSVersion.ToString(),
                        ProcessorCount = Environment.ProcessorCount,
                        WorkingSet = Environment.WorkingSet,
                        Version = Environment.Version.ToString(),
                        Is64BitOperatingSystem = Environment.Is64BitOperatingSystem,
                        Is64BitProcess = Environment.Is64BitProcess
                    },
                    Application = new
                    {
                        StartTime = Process.GetCurrentProcess().StartTime,
                        Uptime = DateTime.Now - Process.GetCurrentProcess().StartTime,
                        ThreadCount = Process.GetCurrentProcess().Threads.Count,
                        HandleCount = Process.GetCurrentProcess().HandleCount,
                        MemoryUsage = new
                        {
                            WorkingSet64 = Process.GetCurrentProcess().WorkingSet64,
                            PrivateMemorySize64 = Process.GetCurrentProcess().PrivateMemorySize64,
                            VirtualMemorySize64 = Process.GetCurrentProcess().VirtualMemorySize64
                        }
                    },
                    Checks = healthReport.Entries.Select(entry => new
                    {
                        Name = entry.Key,
                        Status = entry.Value.Status.ToString(),
                        Duration = entry.Value.Duration.TotalMilliseconds,
                        Description = entry.Value.Description,
                        Data = entry.Value.Data,
                        Exception = entry.Value.Exception?.ToString(), // Full exception details for admins
                        Tags = entry.Value.Tags
                    })
                };

                var statusCode = healthReport.Status switch
                {
                    HealthStatus.Healthy => 200,
                    HealthStatus.Degraded => 200,
                    HealthStatus.Unhealthy => 503,
                    _ => 500
                };

                return StatusCode(statusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking detailed system health");
                return StatusCode(500, new { 
                    Status = "Unhealthy", 
                    Error = "Detailed health check failure",
                    Message = ex.Message,
                    Exception = ex.ToString(),
                    Timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get health status for a specific check (Admin only)
        /// </summary>
        /// <param name="checkName">Name of the health check</param>
        /// <returns>Specific health check information</returns>
        [HttpGet("check/{checkName}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetSpecificHealth(string checkName)
        {
            try
            {
                if (string.IsNullOrEmpty(checkName))
                {
                    return BadRequest(new { message = "Check name is required" });
                }

                var healthReport = await _healthCheckService.CheckHealthAsync();
                
                var check = healthReport.Entries.FirstOrDefault(e => 
                    e.Key.Equals(checkName, StringComparison.OrdinalIgnoreCase));

                if (check.Key == null)
                {
                    return NotFound(new { 
                        message = $"Health check '{checkName}' not found",
                        availableChecks = healthReport.Entries.Keys.ToList()
                    });
                }

                var response = new
                {
                    Name = check.Key,
                    Status = check.Value.Status.ToString(),
                    Duration = check.Value.Duration.TotalMilliseconds,
                    Description = check.Value.Description,
                    Data = check.Value.Data,
                    Exception = check.Value.Exception?.ToString(),
                    Tags = check.Value.Tags,
                    Timestamp = DateTime.UtcNow
                };

                var statusCode = check.Value.Status switch
                {
                    HealthStatus.Healthy => 200,
                    HealthStatus.Degraded => 200,
                    HealthStatus.Unhealthy => 503,
                    _ => 500
                };

                return StatusCode(statusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking specific health for {CheckName}", checkName);
                return StatusCode(500, new { 
                    Status = "Unhealthy", 
                    Error = $"Health check '{checkName}' failure",
                    Message = ex.Message,
                    Timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Simple liveness probe endpoint
        /// </summary>
        /// <returns>Simple alive response</returns>
        [HttpGet("alive")]
        [AllowAnonymous]
        public IActionResult Alive()
        {
            return Ok(new { 
                Status = "Alive", 
                Timestamp = DateTime.UtcNow,
                Version = GetType().Assembly.GetName().Version?.ToString()
            });
        }

        /// <summary>
        /// Simple readiness probe endpoint
        /// </summary>
        /// <returns>Readiness status</returns>
        [HttpGet("ready")]
        [AllowAnonymous]
        public async Task<IActionResult> Ready()
        {
            try
            {
                // Perform minimal readiness checks
                var healthReport = await _healthCheckService.CheckHealthAsync(
                    check => check.Tags.Contains("readiness")
                );

                var isReady = healthReport.Status == HealthStatus.Healthy;

                return Ok(new { 
                    Status = isReady ? "Ready" : "NotReady",
                    Timestamp = DateTime.UtcNow
                });
            }
            catch
            {
                return Ok(new { 
                    Status = "NotReady", 
                    Timestamp = DateTime.UtcNow
                });
            }
        }
    }
}