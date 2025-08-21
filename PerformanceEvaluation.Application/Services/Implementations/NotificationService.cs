// PerformanceEvaluation.Infrastructure/Services/Implementations/NotificationService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Application.DTOs.Notification;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Enums;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Services.Interfaces;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.Json;

namespace PerformanceEvaluation.Infrastructure.Services.Implementations
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            ApplicationDbContext context,
            IConfiguration configuration,
            ILogger<NotificationService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        #region Email Services

        public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true)
        {
            try
            {
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                var enableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true");
                var username = _configuration["Email:Username"];
                var password = _configuration["Email:Password"];
                var fromEmail = _configuration["Email:FromEmail"];
                var fromName = _configuration["Email:FromName"];

                if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                {
                    _logger.LogWarning("Email configuration is incomplete. Skipping email send.");
                    return;
                }

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    EnableSsl = enableSsl,
                    Credentials = new NetworkCredential(username, password)
                };

                var message = new MailMessage
                {
                    From = new MailAddress(fromEmail ?? username!, fromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml
                };

                message.To.Add(to);

                await client.SendMailAsync(message);
                _logger.LogInformation("Email sent successfully to {To} with subject: {Subject}", to, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To} with subject: {Subject}", to, subject);
                throw;
            }
        }

        public async Task SendEmailAsync(EmailNotificationDto emailNotification)
        {
            if (!string.IsNullOrEmpty(emailNotification.TemplateName))
            {
                emailNotification.Body = await ProcessEmailTemplateAsync(emailNotification.TemplateName, emailNotification.TemplateData);
            }

            await SendEmailAsync(emailNotification.ToEmail, emailNotification.Subject, emailNotification.Body, emailNotification.IsHtml);
        }

        public async Task SendBulkEmailAsync(List<EmailNotificationDto> emailNotifications)
        {
            var tasks = emailNotifications.Select(async email =>
            {
                try
                {
                    await SendEmailAsync(email);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send bulk email to {Email}", email.ToEmail);
                }
            });

            await Task.WhenAll(tasks);
            _logger.LogInformation("Bulk email operation completed for {Count} recipients", emailNotifications.Count);
        }

        public async Task SendTemplateEmailAsync(string to, string templateName, Dictionary<string, object> templateData)
        {
            var body = await ProcessEmailTemplateAsync(templateName, templateData);
            var subject = templateData.ContainsKey("Subject") ? templateData["Subject"].ToString() : "Notification";
            
            await SendEmailAsync(to, subject!, body);
        }

        public async Task<string> ProcessEmailTemplateAsync(string templateName, Dictionary<string, object> data)
        {
            try
            {
                var templatePath = Path.Combine("Templates", "Email", $"{templateName}.html");
                
                if (!File.Exists(templatePath))
                {
                    _logger.LogWarning("Email template not found: {TemplateName}. Using default template.", templateName);
                    return GetDefaultEmailTemplate(data);
                }

                var template = await File.ReadAllTextAsync(templatePath);
                
                foreach (var kvp in data)
                {
                    var placeholder = $"{{{{{kvp.Key}}}}}";
                    template = template.Replace(placeholder, kvp.Value?.ToString() ?? "");
                }

                return template;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing email template: {TemplateName}", templateName);
                return GetDefaultEmailTemplate(data);
            }
        }

        #endregion

        #region Evaluation-specific Notifications

        public async Task SendEvaluationAssignedNotificationAsync(int evaluationId)
        {
            var evaluation = await _context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .FirstOrDefaultAsync(e => e.ID == evaluationId);

            if (evaluation == null)
            {
                _logger.LogWarning("Evaluation not found for notification: {EvaluationId}", evaluationId);
                return;
            }

            var title = "New Performance Evaluation Assigned";
            var message = $"You have been assigned to evaluate {evaluation.Employee.FirstName} {evaluation.Employee.LastName} for the period {evaluation.Period}.";

            // Create in-app notification
            await CreateInAppNotificationAsync(
                evaluation.EvaluatorID,
                title,
                message,
                "Info",
                $"/evaluations/{evaluationId}",
                new Dictionary<string, object>
                {
                    ["EvaluationId"] = evaluationId,
                    ["EmployeeName"] = $"{evaluation.Employee.FirstName} {evaluation.Employee.LastName}",
                    ["Period"] = evaluation.Period,
                    ["DueDate"] = evaluation.EndDate.ToString("yyyy-MM-dd")
                });

            // Send email if enabled
            if (await ShouldSendEmailNotificationAsync(evaluation.EvaluatorID, "EvaluationAssigned"))
            {
                var templateData = new Dictionary<string, object>
                {
                    ["Subject"] = title,
                    ["EvaluatorName"] = $"{evaluation.Evaluator.FirstName} {evaluation.Evaluator.LastName}",
                    ["EmployeeName"] = $"{evaluation.Employee.FirstName} {evaluation.Employee.LastName}",
                    ["Period"] = evaluation.Period,
                    ["DueDate"] = evaluation.EndDate.ToString("yyyy-MM-dd"),
                    ["EvaluationUrl"] = $"{_configuration["App:BaseUrl"]}/evaluations/{evaluationId}",
                    ["Message"] = message
                };

                await SendTemplateEmailAsync(evaluation.Evaluator.Email, "evaluation-assigned", templateData);
            }

            _logger.LogInformation("Evaluation assigned notification sent for evaluation {EvaluationId}", evaluationId);
        }

        public async Task SendEvaluationCompletedNotificationAsync(int evaluationId)
        {
            var evaluation = await _context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .FirstOrDefaultAsync(e => e.ID == evaluationId);

            if (evaluation == null) return;

            var title = "Performance Evaluation Completed";
            var message = $"Your performance evaluation for the period {evaluation.Period} has been completed by {evaluation.Evaluator.FirstName} {evaluation.Evaluator.LastName}.";

            // Notify the employee
            await CreateInAppNotificationAsync(
                evaluation.EmployeeID,
                title,
                message,
                "Success",
                $"/evaluations/{evaluationId}",
                new Dictionary<string, object>
                {
                    ["EvaluationId"] = evaluationId,
                    ["EvaluatorName"] = $"{evaluation.Evaluator.FirstName} {evaluation.Evaluator.LastName}",
                    ["Period"] = evaluation.Period,
                    ["Score"] = evaluation.TotalScore.ToString("F2") ?? "N/A"
                });

            // Notify managers and HR
            var managersAndHR = await _context.Users
                .Where(u => u.RoleAssignments.Any(ra => ra.Role.Name == "Admin" || ra.Role.Name == "Manager"))
                .ToListAsync();

            foreach (var manager in managersAndHR)
            {
                await CreateInAppNotificationAsync(
                    manager.ID,
                    "Evaluation Completed",
                    $"Evaluation for {evaluation.Employee.FirstName} {evaluation.Employee.LastName} has been completed.",
                    "Info",
                    $"/evaluations/{evaluationId}");
            }

            // Send email notifications
            if (await ShouldSendEmailNotificationAsync(evaluation.EmployeeID, "EvaluationCompleted"))
            {
                var templateData = new Dictionary<string, object>
                {
                    ["Subject"] = title,
                    ["EmployeeName"] = $"{evaluation.Employee.FirstName} {evaluation.Employee.LastName}",
                    ["EvaluatorName"] = $"{evaluation.Evaluator.FirstName} {evaluation.Evaluator.LastName}",
                    ["Period"] = evaluation.Period,
                    ["Score"] = evaluation.TotalScore.ToString("F2") ?? "N/A",
                    ["EvaluationUrl"] = $"{_configuration["App:BaseUrl"]}/evaluations/{evaluationId}",
                    ["Message"] = message
                };

                await SendTemplateEmailAsync(evaluation.Employee.Email, "evaluation-completed", templateData);
            }

            _logger.LogInformation("Evaluation completed notification sent for evaluation {EvaluationId}", evaluationId);
        }

        public async Task SendEvaluationDueNotificationAsync(int evaluationId)
        {
            var evaluation = await _context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .FirstOrDefaultAsync(e => e.ID == evaluationId);

            if (evaluation == null) return;

            var daysUntilDue = (evaluation.EndDate - DateTime.Now).Days;
            var title = $"Performance Evaluation Due in {daysUntilDue} Days";
            var message = $"Reminder: The evaluation for {evaluation.Employee.FirstName} {evaluation.Employee.LastName} is due on {evaluation.EndDate:yyyy-MM-dd}.";

            await CreateInAppNotificationAsync(
                evaluation.EvaluatorID,
                title,
                message,
                "Warning",
                $"/evaluations/{evaluationId}",
                new Dictionary<string, object>
                {
                    ["EvaluationId"] = evaluationId,
                    ["DaysRemaining"] = daysUntilDue,
                    ["DueDate"] = evaluation.EndDate.ToString("yyyy-MM-dd")
                });

            if (await ShouldSendEmailNotificationAsync(evaluation.EvaluatorID, "EvaluationDue"))
            {
                var templateData = new Dictionary<string, object>
                {
                    ["Subject"] = title,
                    ["EvaluatorName"] = $"{evaluation.Evaluator.FirstName} {evaluation.Evaluator.LastName}",
                    ["EmployeeName"] = $"{evaluation.Employee.FirstName} {evaluation.Employee.LastName}",
                    ["Period"] = evaluation.Period,
                    ["DueDate"] = evaluation.EndDate.ToString("yyyy-MM-dd"),
                    ["DaysRemaining"] = daysUntilDue,
                    ["EvaluationUrl"] = $"{_configuration["App:BaseUrl"]}/evaluations/{evaluationId}",
                    ["Message"] = message
                };

                await SendTemplateEmailAsync(evaluation.Evaluator.Email, "evaluation-due", templateData);
            }

            _logger.LogInformation("Evaluation due notification sent for evaluation {EvaluationId}", evaluationId);
        }

        public async Task SendEvaluationOverdueNotificationAsync(int evaluationId)
        {
            var evaluation = await _context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .FirstOrDefaultAsync(e => e.ID == evaluationId);

            if (evaluation == null) return;

            var daysOverdue = (DateTime.Now - evaluation.EndDate).Days;
            var title = $"Performance Evaluation Overdue ({daysOverdue} days)";
            var message = $"URGENT: The evaluation for {evaluation.Employee.FirstName} {evaluation.Employee.LastName} was due on {evaluation.EndDate:yyyy-MM-dd} and is now {daysOverdue} days overdue.";

            await CreateInAppNotificationAsync(
                evaluation.EvaluatorID,
                title,
                message,
                "Error",
                $"/evaluations/{evaluationId}",
                new Dictionary<string, object>
                {
                    ["EvaluationId"] = evaluationId,
                    ["DaysOverdue"] = daysOverdue,
                    ["DueDate"] = evaluation.EndDate.ToString("yyyy-MM-dd")
                });

            // Also notify managers
            var managers = await _context.Users
                .Where(u => u.RoleAssignments.Any(ra => ra.Role.Name == "Manager" || ra.Role.Name == "Admin"))
                .ToListAsync();

            foreach (var manager in managers)
            {
                await CreateInAppNotificationAsync(
                    manager.ID,
                    $"Overdue Evaluation Alert",
                    $"Evaluation by {evaluation.Evaluator.FirstName} {evaluation.Evaluator.LastName} for {evaluation.Employee.FirstName} {evaluation.Employee.LastName} is {daysOverdue} days overdue.",
                    "Error",
                    $"/evaluations/{evaluationId}");
            }

            _logger.LogInformation("Evaluation overdue notification sent for evaluation {EvaluationId}", evaluationId);
        }

        public async Task SendEvaluationApprovedNotificationAsync(int evaluationId)
        {
            var evaluation = await _context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .FirstOrDefaultAsync(e => e.ID == evaluationId);

            if (evaluation == null) return;

            // Notify employee
            await CreateInAppNotificationAsync(
                evaluation.EmployeeID,
                "Evaluation Approved",
                $"Your performance evaluation for {evaluation.Period} has been approved and finalized.",
                "Success",
                $"/evaluations/{evaluationId}");

            // Notify evaluator
            await CreateInAppNotificationAsync(
                evaluation.EvaluatorID,
                "Evaluation Approved",
                $"Your evaluation for {evaluation.Employee.FirstName} {evaluation.Employee.LastName} has been approved.",
                "Success",
                $"/evaluations/{evaluationId}");

            _logger.LogInformation("Evaluation approved notification sent for evaluation {EvaluationId}", evaluationId);
        }

        public async Task SendEvaluationRejectedNotificationAsync(int evaluationId, string reason)
        {
            var evaluation = await _context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .FirstOrDefaultAsync(e => e.ID == evaluationId);

            if (evaluation == null) return;

            var message = $"Your evaluation for {evaluation.Employee.FirstName} {evaluation.Employee.LastName} has been rejected. Reason: {reason}";

            await CreateInAppNotificationAsync(
                evaluation.EvaluatorID,
                "Evaluation Rejected",
                message,
                "Error",
                $"/evaluations/{evaluationId}",
                new Dictionary<string, object>
                {
                    ["EvaluationId"] = evaluationId,
                    ["Reason"] = reason
                });

            _logger.LogInformation("Evaluation rejected notification sent for evaluation {EvaluationId}", evaluationId);
        }

        #endregion

        #region System Notifications

        public async Task SendWelcomeNotificationAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.ID == userId);

            if (user == null) return;

            var title = "Welcome to Performance Evaluation System";
            var message = $"Welcome to the Performance Evaluation System! Your account has been successfully created.";

            await CreateInAppNotificationAsync(
                userId,
                title,
                message,
                "Success",
                "/dashboard",
                new Dictionary<string, object>
                {
                    ["WelcomeDate"] = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    ["Department"] = user.Department?.Name ?? "N/A"
                });

            if (await ShouldSendEmailNotificationAsync(userId, "Welcome"))
            {
                var templateData = new Dictionary<string, object>
                {
                    ["Subject"] = title,
                    ["UserName"] = $"{user.FirstName} {user.LastName}",
                    ["DepartmentName"] = user.Department?.Name ?? "N/A",
                    ["LoginUrl"] = $"{_configuration["App:BaseUrl"]}/login",
                    ["Message"] = message
                };

                await SendTemplateEmailAsync(user.Email, "welcome", templateData);
            }

            _logger.LogInformation("Welcome notification sent to user {UserId}", userId);
        }

        public async Task SendPasswordResetNotificationAsync(int userId, string resetToken)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            var title = "Password Reset Request";
            var message = "A password reset has been requested for your account. If you didn't request this, please ignore this notification.";

            await CreateInAppNotificationAsync(
                userId,
                title,
                message,
                "Warning",
                null,
                new Dictionary<string, object>
                {
                    ["ResetToken"] = resetToken,
                    ["RequestTime"] = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                });

            // Always send email for password reset
            var templateData = new Dictionary<string, object>
            {
                ["Subject"] = title,
                ["UserName"] = $"{user.FirstName} {user.LastName}",
                ["ResetUrl"] = $"{_configuration["App:BaseUrl"]}/reset-password?token={resetToken}",
                ["ExpiryTime"] = DateTime.UtcNow.AddHours(1).ToString("yyyy-MM-dd HH:mm:ss"),
                ["Message"] = message
            };

            await SendTemplateEmailAsync(user.Email, "password-reset", templateData);

            _logger.LogInformation("Password reset notification sent to user {UserId}", userId);
        }

        public async Task SendAccountDeactivatedNotificationAsync(int userId, string reason)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            var title = "Account Deactivated";
            var message = $"Your account has been deactivated. Reason: {reason}";

            await CreateInAppNotificationAsync(
                userId,
                title,
                message,
                "Error",
                null,
                new Dictionary<string, object>
                {
                    ["Reason"] = reason,
                    ["DeactivationDate"] = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                });

            // Always send email for account deactivation
            var templateData = new Dictionary<string, object>
            {
                ["Subject"] = title,
                ["UserName"] = $"{user.FirstName} {user.LastName}",
                ["Reason"] = reason,
                ["DeactivationDate"] = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                ["ContactEmail"] = _configuration["Email:FromEmail"] ?? "support@company.com",
                ["Message"] = message
            };

            await SendTemplateEmailAsync(user.Email, "account-deactivated", templateData);

            _logger.LogInformation("Account deactivated notification sent to user {UserId}", userId);
        }

        public async Task SendSystemMaintenanceNotificationAsync(List<int> userIds, DateTime maintenanceDate)
        {
            var title = "Scheduled System Maintenance";
            var message = $"The system will be under maintenance on {maintenanceDate:yyyy-MM-dd HH:mm}. Please save your work and plan accordingly.";

            var notifications = userIds.Select(userId => new CreateNotificationRequest
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = "Warning",
                Metadata = new Dictionary<string, object>
                {
                    ["MaintenanceDate"] = maintenanceDate.ToString("yyyy-MM-dd HH:mm:ss"),
                    ["Duration"] = "2 hours (estimated)"
                }
            }).ToList();

            await CreateBulkNotificationsAsync(notifications);

            _logger.LogInformation("System maintenance notification sent to {UserCount} users", userIds.Count);
        }

        #endregion

        #region Bulk Notifications

        public async Task SendBulkNotificationAsync(List<int> userIds, string subject, string message)
        {
            var request = new BulkNotificationRequest
            {
                UserIds = userIds,
                Title = subject,
                Message = message,
                Type = "Info",
                SendEmail = false
            };

            await SendBulkNotificationAsync(request);
        }

        public async Task SendBulkNotificationAsync(BulkNotificationRequest request)
        {
            var notifications = request.UserIds.Select(userId => new CreateNotificationRequest
            {
                UserId = userId,
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                ActionUrl = request.ActionUrl,
                Metadata = request.Metadata
            }).ToList();

            await CreateBulkNotificationsAsync(notifications);

            if (request.SendEmail)
            {
                var users = await _context.Users
                    .Where(u => request.UserIds.Contains(u.ID))
                    .ToListAsync();

                var emailNotifications = users.Select(user => new EmailNotificationDto
                {
                    ToEmail = user.Email,
                    ToName = $"{user.FirstName} {user.LastName}",
                    Subject = request.Title,
                    Body = request.Message,
                    IsHtml = false
                }).ToList();

                await SendBulkEmailAsync(emailNotifications);
            }

            _logger.LogInformation("Bulk notification sent to {UserCount} users", request.UserIds.Count);
        }

        public async Task SendDepartmentNotificationAsync(int departmentId, string subject, string message)
        {
            var userIds = await _context.Users
                .Where(u => u.DepartmentID == departmentId && u.IsActive)
                .Select(u => u.ID)
                .ToListAsync();

            if (userIds.Any())
            {
                await SendBulkNotificationAsync(userIds, subject, message);
                _logger.LogInformation("Department notification sent to department {DepartmentId} with {UserCount} users", departmentId, userIds.Count);
            }
        }

        public async Task SendRoleBasedNotificationAsync(string roleName, string subject, string message)
        {
            var userIds = await _context.Users
                .Where(u => u.RoleAssignments.Any(ra => ra.Role.Name == roleName) && u.IsActive)
                .Select(u => u.ID)
                .ToListAsync();

            if (userIds.Any())
            {
                await SendBulkNotificationAsync(userIds, subject, message);
                _logger.LogInformation("Role-based notification sent to role {RoleName} with {UserCount} users", roleName, userIds.Count);
            }
        }

        #endregion

        #region In-App Notifications

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, int pageNumber = 1, int pageSize = 20)
        {
            var rawNotifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new
                {
                    n.Id,
                    n.Title,
                    n.Message,
                    n.Type,
                    n.IsRead,
                    n.CreatedDate,
                    n.ReadDate,
                    n.ActionUrl,
                    n.Metadata // Keep as string for now
                })
                .ToListAsync();

            // Then, process the metadata in memory
            var notifications = rawNotifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                CreatedDate = n.CreatedDate,
                ReadDate = n.ReadDate,
                ActionUrl = n.ActionUrl,
                Metadata = ProcessMetadata(n.Metadata)
            }).ToList();

            return notifications;
        }

        public async Task<List<NotificationDto>> GetUnreadNotificationsAsync(int userId)
        {
            var rawNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .OrderByDescending(n => n.CreatedDate)
                .Take(50)
                .Select(n => new
                {
                    n.Id,
                    n.Title,
                    n.Message,
                    n.Type,
                    n.IsRead,
                    n.CreatedDate,
                    n.ReadDate,
                    n.ActionUrl,
                    n.Metadata // Keep as string for now
                })
                .ToListAsync();

            // Then, process the metadata in memory
            var notifications = rawNotifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                CreatedDate = n.CreatedDate,
                ReadDate = n.ReadDate,
                ActionUrl = n.ActionUrl,
                Metadata = ProcessMetadata(n.Metadata)
            }).ToList();

            return notifications;
        }

        public async Task<NotificationSummaryDto> GetNotificationSummaryAsync(int userId)
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var weekAgo = today.AddDays(-7);

            var summary = new NotificationSummaryDto
            {
                TotalNotifications = await _context.Notifications.CountAsync(n => n.UserId == userId),
                UnreadCount = await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead),
                TodayCount = await _context.Notifications.CountAsync(n => n.UserId == userId && n.CreatedDate.Date == today),
                WeekCount = await _context.Notifications.CountAsync(n => n.UserId == userId && n.CreatedDate >= weekAgo),
                RecentNotifications = await GetUserNotificationsAsync(userId, 1, 5)
            };

            return summary;
        }

        public async Task<int> GetUnreadNotificationCountAsync(int userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        #endregion

        #region Notification Management

        public async Task<NotificationDto?> GetNotificationByIdAsync(int notificationId, int userId)
        {
            var rawNotification = await _context.Notifications
                .Where(n => n.Id == notificationId && n.UserId == userId)
                .Select(n => new
                {
                    n.Id,
                    n.Title,
                    n.Message,
                    n.Type,
                    n.IsRead,
                    n.CreatedDate,
                    n.ReadDate,
                    n.ActionUrl,
                    n.Metadata // Keep as string for now
                })
                .FirstOrDefaultAsync();

            // Return null if notification not found
            if (rawNotification == null)
                return null;

            // Then, process the metadata in memory
            var notification = new NotificationDto
            {
                Id = rawNotification.Id,
                Title = rawNotification.Title,
                Message = rawNotification.Message,
                Type = rawNotification.Type,
                IsRead = rawNotification.IsRead,
                CreatedDate = rawNotification.CreatedDate,
                ReadDate = rawNotification.ReadDate,
                ActionUrl = rawNotification.ActionUrl,
                Metadata = ProcessMetadata(rawNotification.Metadata)
            };

            return notification;
        }

        public async Task MarkNotificationAsReadAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification != null && !notification.IsRead)
            {
                notification.IsRead = true;
                notification.ReadDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Notification {NotificationId} marked as read for user {UserId}", notificationId, userId);
            }
        }

        public async Task MarkAllNotificationsAsReadAsync(int userId)
        {
            var unreadNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            var readDate = DateTime.UtcNow;
            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
                notification.ReadDate = readDate;
            }

            if (unreadNotifications.Any())
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("All {Count} notifications marked as read for user {UserId}", unreadNotifications.Count, userId);
            }
        }

        public async Task MarkNotificationsAsReadAsync(List<int> notificationIds, int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => notificationIds.Contains(n.Id) && n.UserId == userId && !n.IsRead)
                .ToListAsync();

            var readDate = DateTime.UtcNow;
            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadDate = readDate;
            }

            if (notifications.Any())
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("{Count} notifications marked as read for user {UserId}", notifications.Count, userId);
            }
        }

        public async Task DeleteNotificationAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification != null)
            {
                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Notification {NotificationId} deleted for user {UserId}", notificationId, userId);
            }
        }

        public async Task DeleteAllReadNotificationsAsync(int userId)
        {
            var readNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.IsRead)
                .ToListAsync();

            if (readNotifications.Any())
            {
                _context.Notifications.RemoveRange(readNotifications);
                await _context.SaveChangesAsync();

                _logger.LogInformation("All {Count} read notifications deleted for user {UserId}", readNotifications.Count, userId);
            }
        }

        #endregion

        #region Notification Creation

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request)
        {
            var notification = new Notification
            {
                UserId = request.UserId,
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                ActionUrl = request.ActionUrl,
                IsRead = false,
                CreatedDate = DateTime.UtcNow,
                Metadata = request.Metadata.Any() ? JsonSerializer.Serialize(request.Metadata) : null
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return new NotificationDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                IsRead = notification.IsRead,
                CreatedDate = notification.CreatedDate,
                ReadDate = notification.ReadDate,
                ActionUrl = notification.ActionUrl,
                Metadata = request.Metadata
            };
        }

        public async Task<List<NotificationDto>> CreateBulkNotificationsAsync(List<CreateNotificationRequest> requests)
        {
            var notifications = requests.Select(request => new Notification
            {
                UserId = request.UserId,
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                ActionUrl = request.ActionUrl,
                IsRead = false,
                CreatedDate = DateTime.UtcNow,
                Metadata = request.Metadata.Any() ? JsonSerializer.Serialize(request.Metadata) : null
            }).ToList();

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();

            return notifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                CreatedDate = n.CreatedDate,
                ReadDate = n.ReadDate,
                ActionUrl = n.ActionUrl,
                Metadata = string.IsNullOrEmpty(n.Metadata) ? new Dictionary<string, object>() :
                          JsonSerializer.Deserialize<Dictionary<string, object>>(n.Metadata) ?? new Dictionary<string, object>()
            }).ToList();
        }

        #endregion

        #region Notification Preferences

        public async Task<NotificationPreferencesDto> GetUserPreferencesAsync(int userId)
        {
            // Check if user preferences exist in database (you might want to create a UserPreferences entity)
            // For now, return default preferences
            return new NotificationPreferencesDto
            {
                UserId = userId,
                EmailNotifications = true,
                InAppNotifications = true,
                EvaluationReminders = true,
                StatusUpdates = true,
                SystemAlerts = true,
                PreferredTime = "09:00",
                TimeZone = "UTC"
            };
        }

        public async Task UpdateUserPreferencesAsync(int userId, NotificationPreferencesDto preferences)
        {
            // This would update user preferences in database
            // For now, just log the update
            _logger.LogInformation("Notification preferences updated for user {UserId}", userId);
        }

        #endregion

        #region Scheduled Notifications

        public async Task ScheduleNotificationAsync(int userId, string title, string message, DateTime scheduledTime)
        {
            // This would create a scheduled notification in database
            // For now, create immediate notification with scheduled metadata
            await CreateInAppNotificationAsync(
                userId,
                title,
                message,
                "Info",
                null,
                new Dictionary<string, object>
                {
                    ["ScheduledTime"] = scheduledTime.ToString("yyyy-MM-dd HH:mm:ss"),
                    ["IsScheduled"] = true
                });

            _logger.LogInformation("Notification scheduled for user {UserId} at {ScheduledTime}", userId, scheduledTime);
        }

        public async Task ProcessScheduledNotificationsAsync()
        {
            // This would process scheduled notifications
            // Implementation would check for notifications scheduled for current time
            _logger.LogInformation("Processing scheduled notifications");
        }

        public async Task CancelScheduledNotificationAsync(int notificationId)
        {
            // This would cancel a scheduled notification
            _logger.LogInformation("Scheduled notification {NotificationId} cancelled", notificationId);
        }

        #endregion

        #region Notification Statistics

        public async Task<Dictionary<string, int>> GetNotificationStatsAsync(int userId)
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var thisWeek = today.AddDays(-7);
            var thisMonth = today.AddDays(-30);

            var stats = new Dictionary<string, int>
            {
                ["Total"] = await _context.Notifications.CountAsync(n => n.UserId == userId),
                ["Unread"] = await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead),
                ["Today"] = await _context.Notifications.CountAsync(n => n.UserId == userId && n.CreatedDate.Date == today),
                ["ThisWeek"] = await _context.Notifications.CountAsync(n => n.UserId == userId && n.CreatedDate >= thisWeek),
                ["ThisMonth"] = await _context.Notifications.CountAsync(n => n.UserId == userId && n.CreatedDate >= thisMonth),
                ["Info"] = await _context.Notifications.CountAsync(n => n.UserId == userId && n.Type == "Info"),
                ["Warning"] = await _context.Notifications.CountAsync(n => n.UserId == userId && n.Type == "Warning"),
                ["Success"] = await _context.Notifications.CountAsync(n => n.UserId == userId && n.Type == "Success"),
                ["Error"] = await _context.Notifications.CountAsync(n => n.UserId == userId && n.Type == "Error")
            };

            return stats;
        }

        public async Task<Dictionary<string, int>> GetSystemNotificationStatsAsync()
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var thisWeek = today.AddDays(-7);

            var stats = new Dictionary<string, int>
            {
                ["TotalNotifications"] = await _context.Notifications.CountAsync(),
                ["TotalUsers"] = await _context.Notifications.Select(n => n.UserId).Distinct().CountAsync(),
                ["TodayNotifications"] = await _context.Notifications.CountAsync(n => n.CreatedDate.Date == today),
                ["WeekNotifications"] = await _context.Notifications.CountAsync(n => n.CreatedDate >= thisWeek),
                ["UnreadNotifications"] = await _context.Notifications.CountAsync(n => !n.IsRead)
            };

            return stats;
        }

        #endregion

        #region Validation and Utilities

        public async Task<bool> CanSendNotificationToUserAsync(int userId, string notificationType)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsActive)
            {
                return false;
            }

            // Check user preferences (would implement actual preferences check)
            var preferences = await GetUserPreferencesAsync(userId);
            
            return notificationType switch
            {
                "EvaluationReminder" => preferences.EvaluationReminders,
                "StatusUpdate" => preferences.StatusUpdates,
                "SystemAlert" => preferences.SystemAlerts,
                _ => true
            };
        }

        public async Task<List<string>> ValidateNotificationRequestAsync(SendNotificationRequest request)
        {
            var errors = new List<string>();

            if (!request.UserIds.Any())
            {
                errors.Add("At least one user ID is required");
            }

            if (string.IsNullOrEmpty(request.Subject))
            {
                errors.Add("Subject is required");
            }

            if (string.IsNullOrEmpty(request.Message))
            {
                errors.Add("Message is required");
            }

            if (request.UserIds.Count > 1000)
            {
                errors.Add("Cannot send to more than 1000 users at once");
            }

            // Validate user IDs exist
            var existingUserIds = await _context.Users
                .Where(u => request.UserIds.Contains(u.ID))
                .Select(u => u.ID)
                .ToListAsync();

            var invalidUserIds = request.UserIds.Except(existingUserIds).ToList();
            if (invalidUserIds.Any())
            {
                errors.Add($"Invalid user IDs: {string.Join(", ", invalidUserIds)}");
            }

            return errors;
        }

        public async Task CleanupOldNotificationsAsync(int daysToKeep = 30)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-daysToKeep);
            
            var oldNotifications = await _context.Notifications
                .Where(n => n.CreatedDate < cutoffDate && n.IsRead)
                .ToListAsync();

            if (oldNotifications.Any())
            {
                _context.Notifications.RemoveRange(oldNotifications);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Cleaned up {Count} old notifications older than {Days} days", oldNotifications.Count, daysToKeep);
            }
        }

        #endregion

        #region Private Helper Methods

        private async Task CreateInAppNotificationAsync(
            int userId, 
            string title, 
            string message, 
            string type, 
            string? actionUrl = null,
            Dictionary<string, object>? metadata = null)
        {
            var request = new CreateNotificationRequest
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = type,
                ActionUrl = actionUrl,
                Metadata = metadata ?? new Dictionary<string, object>()
            };

            await CreateNotificationAsync(request);
        }

        private async Task<bool> ShouldSendEmailNotificationAsync(int userId, string notificationType)
        {
            var preferences = await GetUserPreferencesAsync(userId);
            var emailEnabled = bool.Parse(_configuration["Notification:EnableEmailNotifications"] ?? "false");
            
            return emailEnabled && preferences.EmailNotifications && await CanSendNotificationToUserAsync(userId, notificationType);
        }

        private Dictionary<string, object> ProcessMetadata(string? metadata)
    {
        if (string.IsNullOrEmpty(metadata))
            return new Dictionary<string, object>();

        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, object>>(metadata) 
                ?? new Dictionary<string, object>();
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to deserialize notification metadata: {Metadata}", metadata);
            return new Dictionary<string, object>();
        }
    }

        private string GetDefaultEmailTemplate(Dictionary<string, object> data)
        {
            var companyName = _configuration["Email:FromName"] ?? "Performance Evaluation System";
            var subject = data.ContainsKey("Subject") ? data["Subject"].ToString() : "Notification";
            var message = data.ContainsKey("Message") ? data["Message"].ToString() : "You have a new notification.";
            var recipientName = data.ContainsKey("UserName") ? data["UserName"].ToString() : "User";
            var actionUrl = data.ContainsKey("ActionUrl") ? data["ActionUrl"].ToString() : "";

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>{subject}</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ background-color: #007bff; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
        .header h1 {{ margin: 0; font-size: 24px; }}
        .content {{ padding: 30px; }}
        .content h2 {{ color: #333; margin-top: 0; }}
        .content p {{ color: #666; margin-bottom: 20px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }}
        .footer {{ background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef; }}
        .footer p {{ margin: 0; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>{companyName}</h1>
        </div>
        <div class='content'>
            <h2>{subject}</h2>
            <p>Hello {recipientName},</p>
            <p>{message}</p>
            {(string.IsNullOrEmpty(actionUrl) ? "" : $"<a href='{actionUrl}' class='button'>View Details</a>")}
        </div>
        <div class='footer'>
            <p>This is an automated message from the {companyName}.</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>";
        }

        #endregion
    }
}