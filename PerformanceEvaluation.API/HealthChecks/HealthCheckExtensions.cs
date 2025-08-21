using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace PerformanceEvaluation.API.HealthChecks
{
    /// <summary>
    /// Extension methods for health check registration
    /// </summary>
    public static class HealthCheckExtensions
    {
        /// <summary>
        /// Add memory health check
        /// </summary>
        public static IHealthChecksBuilder AddMemoryHealthCheck(
            this IHealthChecksBuilder builder,
            string name,
            HealthStatus? failureStatus = null,
            IEnumerable<string>? tags = null,
            long? thresholdInBytes = null)
        {
            return builder.AddCheck<MemoryHealthCheck>(name, failureStatus, tags);
        }

        /// <summary>
        /// Add disk storage health check
        /// </summary>
        public static IHealthChecksBuilder AddDiskStorageHealthCheck(
            this IHealthChecksBuilder builder,
            Action<DiskStorageOptions> setupAction,
            string name,
            HealthStatus? failureStatus = null,
            IEnumerable<string>? tags = null)
        {
            builder.Services.Configure(setupAction);
            return builder.AddCheck<DiskStorageHealthCheck>(name, failureStatus, tags);
        }
    }

    /// <summary>
    /// Memory health check implementation
    /// </summary>
    public class MemoryHealthCheck : IHealthCheck
    {
        private readonly ILogger<MemoryHealthCheck> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="logger"></param>
        public MemoryHealthCheck(ILogger<MemoryHealthCheck> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="context"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var allocatedBytes = GC.GetTotalMemory(false);
                var workingSet = Environment.WorkingSet;

                var data = new Dictionary<string, object>
                {
                    ["AllocatedBytes"] = allocatedBytes,
                    ["WorkingSetBytes"] = workingSet,
                    ["AllocatedMB"] = allocatedBytes / 1024 / 1024,
                    ["WorkingSetMB"] = workingSet / 1024 / 1024,
                    ["Gen0Collections"] = GC.CollectionCount(0),
                    ["Gen1Collections"] = GC.CollectionCount(1),
                    ["Gen2Collections"] = GC.CollectionCount(2)
                };

                // Check if memory usage is concerning (over 1GB allocated)
                if (allocatedBytes > 1024 * 1024 * 1024)
                {
                    _logger.LogWarning("High memory usage detected: {AllocatedMB}MB allocated",
                        allocatedBytes / 1024 / 1024);

                    return Task.FromResult(HealthCheckResult.Degraded(
                        $"High memory usage: {allocatedBytes / 1024 / 1024}MB allocated",
                        data: data));
                }

                return Task.FromResult(HealthCheckResult.Healthy(
                    $"Memory usage normal: {allocatedBytes / 1024 / 1024}MB allocated",
                    data: data));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Memory health check failed");
                return Task.FromResult(HealthCheckResult.Unhealthy(
                    "Memory health check failed",
                    ex));
            }
        }
    }

    /// <summary>
    /// Disk storage health check implementation
    /// </summary>
    public class DiskStorageHealthCheck : IHealthCheck
    {
        private readonly DiskStorageOptions _options;
        private readonly ILogger<DiskStorageHealthCheck> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="options"></param>
        /// <param name="logger"></param>
        public DiskStorageHealthCheck(
            Microsoft.Extensions.Options.IOptions<DiskStorageOptions> options,
            ILogger<DiskStorageHealthCheck> logger)
        {
            _options = options.Value;
            _logger = logger;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="context"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var issues = new List<string>();
                var data = new Dictionary<string, object>();

                foreach (var driveConfig in _options.Drives)
                {
                    var drive = new DriveInfo(driveConfig.DriveName);

                    if (!drive.IsReady)
                    {
                        issues.Add($"Drive {driveConfig.DriveName} is not ready");
                        continue;
                    }

                    var freeSpaceMB = drive.AvailableFreeSpace / 1024 / 1024;
                    var totalSpaceMB = drive.TotalSize / 1024 / 1024;
                    var usedPercentage = (double)(totalSpaceMB - freeSpaceMB) / totalSpaceMB * 100;

                    data[$"Drive_{driveConfig.DriveName}_FreeSpaceMB"] = freeSpaceMB;
                    data[$"Drive_{driveConfig.DriveName}_TotalSpaceMB"] = totalSpaceMB;
                    data[$"Drive_{driveConfig.DriveName}_UsedPercentage"] = Math.Round(usedPercentage, 2);

                    if (freeSpaceMB < driveConfig.MinimumFreeMegabytes)
                    {
                        issues.Add($"Drive {driveConfig.DriveName} has only {freeSpaceMB}MB free " +
                                  $"(minimum required: {driveConfig.MinimumFreeMegabytes}MB)");
                    }
                }

                if (issues.Any())
                {
                    _logger.LogWarning("Disk storage issues detected: {Issues}", string.Join("; ", issues));
                    return Task.FromResult(HealthCheckResult.Degraded(
                        $"Disk storage issues: {string.Join("; ", issues)}",
                        data: data));
                }

                return Task.FromResult(HealthCheckResult.Healthy(
                    "All disk drives have sufficient free space",
                    data: data));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Disk storage health check failed");
                return Task.FromResult(HealthCheckResult.Unhealthy(
                    "Disk storage health check failed",
                    ex));
            }
        }
    }

    /// <summary>
    /// Configuration for disk storage health check
    /// </summary>
    public class DiskStorageOptions
    {
        /// <summary>
        /// 
        /// </summary>
        public List<DriveConfiguration> Drives { get; set; } = new();

        /// <summary>
        /// 
        /// </summary>
        /// <param name="driveName"></param>
        /// <param name="minimumFreeMegabytes"></param>
        public void AddDrive(string driveName, long minimumFreeMegabytes)
        {
            Drives.Add(new DriveConfiguration
            {
                DriveName = driveName,
                MinimumFreeMegabytes = minimumFreeMegabytes
            });
        }
    }

    /// <summary>
    /// 
    /// </summary>
    public class DriveConfiguration
    {
        /// <summary>
        /// 
        /// </summary>
        public string DriveName { get; set; } = string.Empty;
        /// <summary>
        /// 
        /// </summary>
        public long MinimumFreeMegabytes { get; set; }
    }
}