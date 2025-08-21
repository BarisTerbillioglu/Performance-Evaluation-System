using Microsoft.Extensions.Diagnostics.HealthChecks;
using PerformanceEvaluation.Infrastructure.Services.Interfaces;
using System.Net.NetworkInformation;

namespace PerformanceEvaluation.API.HealthChecks
{
    /// <summary>
    /// Health check for external dependencies like email service, file system, etc.
    /// </summary>
    public class ExternalDependenciesHealthCheck : IHealthCheck
    {
        private readonly IFileService _fileService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ExternalDependenciesHealthCheck> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="fileService"></param>
        /// <param name="configuration"></param>
        /// <param name="logger"></param>
        public ExternalDependenciesHealthCheck(
            IFileService fileService,
            IConfiguration configuration,
            ILogger<ExternalDependenciesHealthCheck> logger)
        {
            _fileService = fileService;
            _configuration = configuration;
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
                // Check file system accessibility
                await CheckFileSystemHealth(issues, data);

                // Check email service configuration
                CheckEmailConfiguration(issues, data);

                // Check internet connectivity for external services
                await CheckInternetConnectivity(issues, data, cancellationToken);

                // Check disk space
                CheckDiskSpace(issues, data);

                data["LastChecked"] = DateTime.UtcNow;
                data["IssuesCount"] = issues.Count;

                if (issues.Any())
                {
                    _logger.LogWarning("External dependencies health check found issues: {Issues}",
                        string.Join("; ", issues));

                    return HealthCheckResult.Degraded(
                        $"External dependencies mostly operational but {issues.Count} issue(s) detected: {string.Join("; ", issues)}",
                        data: data);
                }

                _logger.LogInformation("External dependencies health check passed");

                return HealthCheckResult.Healthy(
                    "All external dependencies are operational",
                    data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "External dependencies health check failed");

                return HealthCheckResult.Unhealthy(
                    "Critical failure in external dependencies",
                    ex,
                    new Dictionary<string, object>
                    {
                        ["Error"] = ex.Message,
                        ["LastChecked"] = DateTime.UtcNow
                    });
            }
        }

        private async Task CheckFileSystemHealth(List<string> issues, Dictionary<string, object> data)
        {
            try
            {
                // Test file system by creating a temporary file
                var testContent = "Health check test";
                var testFileName = $"health_test_{Guid.NewGuid()}.txt";
                
                var filePath = await _fileService.UploadFileAsync(
                    CreateTestFile(testContent, testFileName), 
                    "health-checks", 
                    testFileName);

                // Try to read it back
                var (fileContent, _, _) = await _fileService.DownloadFileAsync(filePath);
                
                // Clean up
                await _fileService.DeleteFileAsync(filePath);

                data["FileSystemOperational"] = true;
                data["FileSystemTestPassed"] = true;
            }
            catch (Exception ex)
            {
                issues.Add($"File system access issue: {ex.Message}");
                data["FileSystemOperational"] = false;
                data["FileSystemError"] = ex.Message;
            }
        }

        private void CheckEmailConfiguration(List<string> issues, Dictionary<string, object> data)
        {
            try
            {
                var emailConfig = _configuration.GetSection("Email");
                var smtpHost = emailConfig["SmtpHost"];
                var smtpPort = emailConfig["SmtpPort"];
                var fromAddress = emailConfig["FromAddress"];

                if (string.IsNullOrEmpty(smtpHost))
                {
                    issues.Add("Email SMTP host not configured");
                    data["EmailConfigured"] = false;
                }
                else if (string.IsNullOrEmpty(fromAddress))
                {
                    issues.Add("Email from address not configured");
                    data["EmailConfigured"] = false;
                }
                else
                {
                    data["EmailConfigured"] = true;
                    data["SmtpHost"] = smtpHost;
                    data["SmtpPort"] = smtpPort;
                }
            }
            catch (Exception ex)
            {
                issues.Add($"Email configuration error: {ex.Message}");
                data["EmailConfigured"] = false;
            }
        }

        private async Task CheckInternetConnectivity(List<string> issues, Dictionary<string, object> data, CancellationToken cancellationToken)
        {
            try
            {
                // Ping a reliable external service
                using var ping = new Ping();
                var reply = await ping.SendPingAsync("8.8.8.8", 5000);
                
                if (reply.Status == IPStatus.Success)
                {
                    data["InternetConnectivity"] = true;
                    data["PingTime"] = reply.RoundtripTime;
                }
                else
                {
                    issues.Add($"Internet connectivity issue: {reply.Status}");
                    data["InternetConnectivity"] = false;
                }
            }
            catch (Exception ex)
            {
                issues.Add($"Internet connectivity check failed: {ex.Message}");
                data["InternetConnectivity"] = false;
            }
        }

        private void CheckDiskSpace(List<string> issues, Dictionary<string, object> data)
        {
            try
            {
                var currentDirectory = Directory.GetCurrentDirectory();
                var drive = new DriveInfo(Path.GetPathRoot(currentDirectory) ?? "C:");
                
                var freeSpaceGB = drive.AvailableFreeSpace / (1024 * 1024 * 1024);
                var totalSpaceGB = drive.TotalSize / (1024 * 1024 * 1024);
                var usedPercentage = (double)(totalSpaceGB - freeSpaceGB) / totalSpaceGB * 100;

                data["DiskFreeSpaceGB"] = freeSpaceGB;
                data["DiskTotalSpaceGB"] = totalSpaceGB;
                data["DiskUsedPercentage"] = Math.Round(usedPercentage, 2);

                if (freeSpaceGB < 1) // Less than 1GB free
                {
                    issues.Add($"Low disk space: Only {freeSpaceGB:F2}GB available");
                }
                else if (usedPercentage > 90)
                {
                    issues.Add($"High disk usage: {usedPercentage:F1}% used");
                }
            }
            catch (Exception ex)
            {
                issues.Add($"Disk space check failed: {ex.Message}");
                data["DiskSpaceCheckFailed"] = true;
            }
        }

        private IFormFile CreateTestFile(string content, string fileName)
        {
            var bytes = System.Text.Encoding.UTF8.GetBytes(content);
            var stream = new MemoryStream(bytes);
            
            return new FormFile(stream, 0, bytes.Length, "file", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "text/plain"
            };
        }
    }
}