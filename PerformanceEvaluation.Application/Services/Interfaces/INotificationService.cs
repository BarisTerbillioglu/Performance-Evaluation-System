// PerformanceEvaluation.Infrastructure/Services/Interfaces/INotificationService.cs
using PerformanceEvaluation.Application.DTOs.Notification;
using System.Security.Claims;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface INotificationService
    {
        // Email Services
        Task SendEmailAsync(string to, string subject, string body, bool isHtml = true);
        Task SendEmailAsync(EmailNotificationDto emailNotification);
        Task SendBulkEmailAsync(List<EmailNotificationDto> emailNotifications);
        
        // Template Email Services
        Task SendTemplateEmailAsync(string to, string templateName, Dictionary<string, object> templateData);
        Task<string> ProcessEmailTemplateAsync(string templateName, Dictionary<string, object> data);
        
        // Evaluation-specific Notifications
        Task SendEvaluationAssignedNotificationAsync(int evaluationId);
        Task SendEvaluationCompletedNotificationAsync(int evaluationId);
        Task SendEvaluationDueNotificationAsync(int evaluationId);
        Task SendEvaluationOverdueNotificationAsync(int evaluationId);
        Task SendEvaluationApprovedNotificationAsync(int evaluationId);
        Task SendEvaluationRejectedNotificationAsync(int evaluationId, string reason);
        
        // System Notifications
        Task SendWelcomeNotificationAsync(int userId);
        Task SendPasswordResetNotificationAsync(int userId, string resetToken);
        Task SendAccountDeactivatedNotificationAsync(int userId, string reason);
        Task SendSystemMaintenanceNotificationAsync(List<int> userIds, DateTime maintenanceDate);
        
        // Bulk Notifications
        Task SendBulkNotificationAsync(List<int> userIds, string subject, string message);
        Task SendBulkNotificationAsync(BulkNotificationRequest request);
        Task SendDepartmentNotificationAsync(int departmentId, string subject, string message);
        Task SendRoleBasedNotificationAsync(string roleName, string subject, string message);
        
        // In-App Notifications
        Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, int pageNumber = 1, int pageSize = 20);
        Task<List<NotificationDto>> GetUnreadNotificationsAsync(int userId);
        Task<NotificationSummaryDto> GetNotificationSummaryAsync(int userId);
        Task<int> GetUnreadNotificationCountAsync(int userId);
        
        // Notification Management
        Task<NotificationDto?> GetNotificationByIdAsync(int notificationId, int userId);
        Task MarkNotificationAsReadAsync(int notificationId, int userId);
        Task MarkAllNotificationsAsReadAsync(int userId);
        Task MarkNotificationsAsReadAsync(List<int> notificationIds, int userId);
        Task DeleteNotificationAsync(int notificationId, int userId);
        Task DeleteAllReadNotificationsAsync(int userId);
        
        // Notification Creation
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request);
        Task<List<NotificationDto>> CreateBulkNotificationsAsync(List<CreateNotificationRequest> requests);
        
        // Notification Preferences
        Task<NotificationPreferencesDto> GetUserPreferencesAsync(int userId);
        Task UpdateUserPreferencesAsync(int userId, NotificationPreferencesDto preferences);
        
        // Scheduled Notifications
        Task ScheduleNotificationAsync(int userId, string title, string message, DateTime scheduledTime);
        Task ProcessScheduledNotificationsAsync();
        Task CancelScheduledNotificationAsync(int notificationId);
        
        // Notification Statistics
        Task<Dictionary<string, int>> GetNotificationStatsAsync(int userId);
        Task<Dictionary<string, int>> GetSystemNotificationStatsAsync();
        
        // Validation and Utilities
        Task<bool> CanSendNotificationToUserAsync(int userId, string notificationType);
        Task<List<string>> ValidateNotificationRequestAsync(SendNotificationRequest request);
        Task CleanupOldNotificationsAsync(int daysToKeep = 30);
    }
}