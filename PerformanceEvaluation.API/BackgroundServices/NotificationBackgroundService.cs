using Microsoft.EntityFrameworkCore;
using PerformanceEvaluation.Core.Enums;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Services.Interfaces;
using PerformanceEvaluation.Application.DTOs.Notification;

namespace PerformanceEvaluation.API.BackgroundServices
{
    /// <summary>
    /// Background service for processing notification tasks
    /// </summary>
    public class NotificationBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<NotificationBackgroundService> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromHours(1);

        /// <summary>
        /// Background service for processing notification tasks
        /// </summary>
        public NotificationBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<NotificationBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        /// <summary>
        /// Executes the background notification processing tasks
        /// </summary>
        /// <param name="stoppingToken">Executes the background notification processing tasks</param>
        /// <returns>A task representing the asynchronous operation</returns>
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Notification Background Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessNotificationTasksAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in notification background service");
                }

                try
                {
                    await Task.Delay(_interval, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }
            }

            _logger.LogInformation("Notification Background Service stopped");
        }

        private async Task ProcessNotificationTasksAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var tasksCompleted = 0;

            try
            {
                // Check for evaluations due in 3 days
                var dueSoonCount = await ProcessEvaluationsDueSoonAsync(context, notificationService, cancellationToken);
                tasksCompleted += dueSoonCount;

                // Check for overdue evaluations
                var overdueCount = await ProcessOverdueEvaluationsAsync(context, notificationService, cancellationToken);
                tasksCompleted += overdueCount;

                // Check for evaluations due today
                var dueTodayCount = await ProcessEvaluationsDueTodayAsync(context, notificationService, cancellationToken);
                tasksCompleted += dueTodayCount;

                // Send weekly summary on Mondays
                if (DateTime.Today.DayOfWeek == DayOfWeek.Monday)
                {
                    await SendWeeklySummaryNotificationsAsync(context, notificationService, cancellationToken);
                }

                // Cleanup old notifications daily at 2 AM
                if (DateTime.Now.Hour == 2)
                {
                    await notificationService.CleanupOldNotificationsAsync(30);
                }

                _logger.LogInformation("Notification tasks completed: {TasksCompleted}", tasksCompleted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing notification tasks");
            }
        }

        private async Task<int> ProcessEvaluationsDueSoonAsync(
            ApplicationDbContext context,
            INotificationService notificationService,
            CancellationToken cancellationToken)
        {
            var threeDaysFromNow = DateTime.Now.AddDays(3).Date;

            var dueSoonEvaluations = await context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Where(e => e.Status == "Pending" &&
                           e.EndDate.Date == threeDaysFromNow)
                .ToListAsync(cancellationToken);

            foreach (var evaluation in dueSoonEvaluations)
            {
                try
                {
                    await notificationService.SendEvaluationDueNotificationAsync(evaluation.ID);
                    _logger.LogInformation("Due soon notification sent for evaluation {EvaluationId}", evaluation.ID);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send due soon notification for evaluation {EvaluationId}", evaluation.ID);
                }
            }

            return dueSoonEvaluations.Count;
        }

        private async Task<int> ProcessOverdueEvaluationsAsync(
            ApplicationDbContext context,
            INotificationService notificationService,
            CancellationToken cancellationToken)
        {
            var overdueEvaluations = await context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Where(e => e.Status == "Pending" &&
                           e.EndDate.Date < DateTime.Now.Date)
                .ToListAsync(cancellationToken);

            foreach (var evaluation in overdueEvaluations)
            {
                try
                {
                    await notificationService.SendEvaluationOverdueNotificationAsync(evaluation.ID);
                    _logger.LogInformation("Overdue notification sent for evaluation {EvaluationId}", evaluation.ID);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send overdue notification for evaluation {EvaluationId}", evaluation.ID);
                }
            }

            return overdueEvaluations.Count;
        }

        private async Task<int> ProcessEvaluationsDueTodayAsync(
            ApplicationDbContext context,
            INotificationService notificationService,
            CancellationToken cancellationToken)
        {
            var today = DateTime.Now.Date;

            var dueTodayEvaluations = await context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Where(e => e.Status == "Pending" &&
                           e.EndDate.Date == today)
                .ToListAsync(cancellationToken);

            foreach (var evaluation in dueTodayEvaluations)
            {
                try
                {
                    await notificationService.CreateNotificationAsync(
                        new CreateNotificationRequest
                        {
                            UserId = evaluation.EvaluatorID,
                            Title = "URGENT: Evaluation Due Today",
                            Message = $"The evaluation for {evaluation.Employee.FirstName} {evaluation.Employee.LastName} is due today ({evaluation.EndDate:yyyy-MM-dd}). Please complete it as soon as possible.",
                            Type = "Error",
                            ActionUrl = $"/evaluations/{evaluation.ID}",
                            Metadata = new Dictionary<string, object>
                            {
                                ["EvaluationId"] = evaluation.ID,
                                ["DueDate"] = evaluation.EndDate.ToString("yyyy-MM-dd"),
                                ["Urgency"] = "High"
                            }
                        });

                    _logger.LogInformation("Due today notification sent for evaluation {EvaluationId}", evaluation.ID);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send due today notification for evaluation {EvaluationId}", evaluation.ID);
                }
            }

            return dueTodayEvaluations.Count;
        }

        private async Task SendWeeklySummaryNotificationsAsync(
            ApplicationDbContext context,
            INotificationService notificationService,
            CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Sending weekly summary notifications");

                var oneWeekAgo = DateTime.Now.AddDays(-7);

                var managersAndAdmins = await context.Users
                    .Include(u => u.RoleAssignments)
                        .ThenInclude(ra => ra.Role)
                    .Where(u => u.RoleAssignments.Any(ra => ra.Role.Name == "Manager" || ra.Role.Name == "Admin")
                               && u.IsActive)
                    .ToListAsync(cancellationToken);

                foreach (var user in managersAndAdmins)
                {
                    try
                    {
                        var departmentFilter = user.RoleAssignments.Any(ra => ra.Role.Name == "Admin")
                            ? null
                            : (int?)user.DepartmentID;

                        var weeklyStats = await GetWeeklyStatsAsync(context, departmentFilter, oneWeekAgo);

                        var summaryMessage = $@"Weekly Performance Evaluation Summary:

📊 Evaluations Completed: {weeklyStats.CompletedEvaluations}
⏳ Evaluations Pending: {weeklyStats.PendingEvaluations}
⚠️ Overdue Evaluations: {weeklyStats.OverdueEvaluations}
📈 Average Score: {weeklyStats.AverageScore:F1}

{(weeklyStats.OverdueEvaluations > 0 ? "⚠️ Please follow up on overdue evaluations." : "✅ Great work keeping evaluations on track!")}";

                        await notificationService.CreateNotificationAsync(
                            new CreateNotificationRequest
                            {
                                UserId = user.ID,
                                Title = "Weekly Evaluation Summary",
                                Message = summaryMessage,
                                Type = weeklyStats.OverdueEvaluations > 0 ? "Warning" : "Info",
                                ActionUrl = "/dashboard",
                                Metadata = new Dictionary<string, object>
                                {
                                    ["WeekStartDate"] = oneWeekAgo.ToString("yyyy-MM-dd"),
                                    ["WeekEndDate"] = DateTime.Now.ToString("yyyy-MM-dd"),
                                    ["CompletedEvaluations"] = weeklyStats.CompletedEvaluations,
                                    ["PendingEvaluations"] = weeklyStats.PendingEvaluations,
                                    ["OverdueEvaluations"] = weeklyStats.OverdueEvaluations,
                                    ["AverageScore"] = weeklyStats.AverageScore
                                }
                            });

                        _logger.LogDebug("Weekly summary sent to user {UserId}", user.ID);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send weekly summary to user {UserId}", user.ID);
                    }
                }

                _logger.LogInformation("Weekly summary notifications completed for {UserCount} users", managersAndAdmins.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending weekly summary notifications");
            }
        }

        private async Task<WeeklyStatsDto> GetWeeklyStatsAsync(
            ApplicationDbContext context,
            int? departmentId,
            DateTime weekStartDate)
        {
            var evaluationsQuery = context.Evaluations
                .Include(e => e.Employee)
                .Where(e => e.CreatedDate >= weekStartDate);

            if (departmentId.HasValue)
            {
                evaluationsQuery = evaluationsQuery.Where(e => e.Employee.DepartmentID == departmentId.Value);
            }

            var evaluations = await evaluationsQuery.ToListAsync();

            var completedEvaluations = evaluations.Count(e => e.Status == "Completed");
            var pendingEvaluations = evaluations.Count(e => e.Status == "Pending");
            var overdueEvaluations = evaluations.Count(e => e.Status == "Pending" && e.EndDate < DateTime.Now);

            var completedWithScores = evaluations
                .Where(e => e.Status == "Completed" && e.TotalScore > 0)
                .ToList();

            var averageScore = completedWithScores.Any()
                ? completedWithScores.Average(e => e.TotalScore)
                : 0;

            return new WeeklyStatsDto
            {
                CompletedEvaluations = completedEvaluations,
                PendingEvaluations = pendingEvaluations,
                OverdueEvaluations = overdueEvaluations,
                AverageScore = averageScore
            };
        }

        /// <summary>
        /// Stops the background service gracefully
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>A task representing the asynchronous operation</returns>
        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Notification Background Service is stopping");
            await base.StopAsync(cancellationToken);
        }
    }

    internal class WeeklyStatsDto
    {
        public int CompletedEvaluations { get; set; }
        public int PendingEvaluations { get; set; }
        public int OverdueEvaluations { get; set; }
        public decimal AverageScore { get; set; }
    }
}

