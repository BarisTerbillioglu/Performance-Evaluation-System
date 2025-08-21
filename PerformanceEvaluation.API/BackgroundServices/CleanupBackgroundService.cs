using PerformanceEvaluation.Infrastructure.Services.Interfaces;

namespace PerformanceEvaluation.API.BackgroundServices
{
    /// <summary>
    /// Background service for cleaning up old files and data
    /// </summary>
    public class CleanupBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<CleanupBackgroundService> _logger;

        /// <summary>
        /// Background service for cleaning up old files and data
        /// </summary>
        public CleanupBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<CleanupBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        /// <summary>
        /// Executes the cleanup tasks
        /// </summary>
        /// <param name="stoppingToken">Cancellation token to stop the service</param>
        /// <returns>A task representing the asynchronous operation</returns>
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                    // Clean up old notifications (older than 30 days)
                    await notificationService.CleanupOldNotificationsAsync(30);

                    // Clean up temporary files older than 1 day
                    CleanupTempFiles();

                    _logger.LogInformation("Cleanup background service completed");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in cleanup background service");
                }

                // Run daily at 2 AM
                var now = DateTime.Now;
                var tomorrow2AM = DateTime.Today.AddDays(1).AddHours(2);
                var delay = tomorrow2AM - now;

                if (delay.TotalMilliseconds > 0)
                {
                    await Task.Delay(delay, stoppingToken);
                }
                else
                {
                    await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
                }
            }
        }

        private void CleanupTempFiles()
        {
            try
            {
                var tempPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "temp");
                if (Directory.Exists(tempPath))
                {
                    var oldFiles = Directory.GetFiles(tempPath)
                        .Where(f => File.GetCreationTime(f) < DateTime.Now.AddDays(-1))
                        .ToArray();

                    foreach (var file in oldFiles)
                    {
                        try
                        {
                            File.Delete(file);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Could not delete temp file: {File}", file);
                        }
                    }

                    if (oldFiles.Any())
                    {
                        _logger.LogInformation("Cleaned up {Count} old temporary files", oldFiles.Length);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up temp files");
            }
        }
    }
}