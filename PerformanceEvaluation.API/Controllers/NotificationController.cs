using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.Notification;
using PerformanceEvaluation.Infrastructure.Services.Interfaces;
using System.Security.Claims;

namespace PerformanceEvaluation.API.Controllers
{
    /// <summary>
    /// 
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationController> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="notificationService"></param>
        /// <param name="logger"></param>
        public NotificationController(
            INotificationService notificationService,
            ILogger<NotificationController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// Get current user's notifications with pagination
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetNotifications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = GetUserId();
                var notifications = await _notificationService.GetUserNotificationsAsync(userId, pageNumber, pageSize);
                
                return Ok(new
                {
                    notifications,
                    pageNumber,
                    pageSize,
                    hasMore = notifications.Count == pageSize
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notifications for user");
                return StatusCode(500, new { message = "Error retrieving notifications" });
            }
        }

        /// <summary>
        /// Get current user's unread notifications
        /// </summary>
        [HttpGet("unread")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetUnreadNotifications()
        {
            try
            {
                var userId = GetUserId();
                var notifications = await _notificationService.GetUnreadNotificationsAsync(userId);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving unread notifications for user");
                return StatusCode(500, new { message = "Error retrieving unread notifications" });
            }
        }

        /// <summary>
        /// Get notification summary for current user
        /// </summary>
        [HttpGet("summary")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetNotificationSummary()
        {
            try
            {
                var userId = GetUserId();
                var summary = await _notificationService.GetNotificationSummaryAsync(userId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notification summary for user");
                return StatusCode(500, new { message = "Error retrieving notification summary" });
            }
        }

        /// <summary>
        /// Get unread notification count for current user
        /// </summary>
        [HttpGet("unread-count")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var userId = GetUserId();
                var count = await _notificationService.GetUnreadNotificationCountAsync(userId);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving unread count for user");
                return StatusCode(500, new { message = "Error retrieving unread count" });
            }
        }

        /// <summary>
        /// Get specific notification by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetNotification(int id)
        {
            try
            {
                var userId = GetUserId();
                var notification = await _notificationService.GetNotificationByIdAsync(id, userId);
                
                if (notification == null)
                {
                    return NotFound(new { message = "Notification not found" });
                }

                return Ok(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notification {NotificationId}", id);
                return StatusCode(500, new { message = "Error retrieving notification" });
            }
        }

        /// <summary>
        /// Mark specific notification as read
        /// </summary>
        [HttpPatch("{id}/read")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var userId = GetUserId();
                await _notificationService.MarkNotificationAsReadAsync(id, userId);
                return Ok(new { message = "Notification marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read: {NotificationId}", id);
                return StatusCode(500, new { message = "Error updating notification" });
            }
        }

        /// <summary>
        /// Mark multiple notifications as read
        /// </summary>
        [HttpPatch("mark-read")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> MarkNotificationsAsRead([FromBody] MarkNotificationsReadRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = GetUserId();
                await _notificationService.MarkNotificationsAsReadAsync(request.NotificationIds, userId);
                return Ok(new { message = $"{request.NotificationIds.Count} notifications marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking multiple notifications as read");
                return StatusCode(500, new { message = "Error updating notifications" });
            }
        }

        /// <summary>
        /// Mark all notifications as read for current user
        /// </summary>
        [HttpPatch("mark-all-read")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = GetUserId();
                await _notificationService.MarkAllNotificationsAsReadAsync(userId);
                return Ok(new { message = "All notifications marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read for user");
                return StatusCode(500, new { message = "Error updating notifications" });
            }
        }

        /// <summary>
        /// Delete specific notification
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            try
            {
                var userId = GetUserId();
                await _notificationService.DeleteNotificationAsync(id, userId);
                return Ok(new { message = "Notification deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification {NotificationId}", id);
                return StatusCode(500, new { message = "Error deleting notification" });
            }
        }

        /// <summary>
        /// Delete all read notifications for current user
        /// </summary>
        [HttpDelete("read")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> DeleteAllReadNotifications()
        {
            try
            {
                var userId = GetUserId();
                await _notificationService.DeleteAllReadNotificationsAsync(userId);
                return Ok(new { message = "All read notifications deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting all read notifications for user");
                return StatusCode(500, new { message = "Error deleting notifications" });
            }
        }

        /// <summary>
        /// Create a new notification (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var notification = await _notificationService.CreateNotificationAsync(request);
                return CreatedAtAction(nameof(GetNotification), new { id = notification.Id }, notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification");
                return StatusCode(500, new { message = "Error creating notification" });
            }
        }

        /// <summary>
        /// Send bulk notification (Admin only)
        /// </summary>
        [HttpPost("bulk")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> SendBulkNotification([FromBody] BulkNotificationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var validationErrors = await _notificationService.ValidateNotificationRequestAsync(new SendNotificationRequest
                {
                    UserIds = request.UserIds,
                    Subject = request.Title,
                    Message = request.Message,
                    Type = request.Type,
                    ActionUrl = request.ActionUrl,
                    SendEmail = request.SendEmail,
                    Metadata = request.Metadata
                });

                if (validationErrors.Any())
                {
                    return BadRequest(new { message = "Validation failed", errors = validationErrors });
                }

                await _notificationService.SendBulkNotificationAsync(request);
                return Ok(new { message = $"Notification sent to {request.UserIds.Count} users" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending bulk notification");
                return StatusCode(500, new { message = "Error sending notification" });
            }
        }

        /// <summary>
        /// Send notification to all users in a department (Admin/Manager only)
        /// </summary>
        [HttpPost("department/{departmentId}")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> SendDepartmentNotification(
            int departmentId, 
            [FromBody] SendNotificationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Check if user has access to this department
                if (!User.IsInRole("Admin"))
                {
                    var userDepartmentId = int.Parse(User.FindFirst("DepartmentID")?.Value ?? "0");
                    if (userDepartmentId != departmentId)
                    {
                        return Forbid("You can only send notifications to your own department");
                    }
                }

                await _notificationService.SendDepartmentNotificationAsync(departmentId, request.Subject, request.Message);
                return Ok(new { message = $"Notification sent to department {departmentId}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending department notification to department {DepartmentId}", departmentId);
                return StatusCode(500, new { message = "Error sending department notification" });
            }
        }

        /// <summary>
        /// Send notification to all users with specific role (Admin only)
        /// </summary>
        [HttpPost("role/{roleName}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> SendRoleNotification(
            string roleName, 
            [FromBody] SendNotificationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await _notificationService.SendRoleBasedNotificationAsync(roleName, request.Subject, request.Message);
                return Ok(new { message = $"Notification sent to all users with role {roleName}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending role-based notification to role {RoleName}", roleName);
                return StatusCode(500, new { message = "Error sending role-based notification" });
            }
        }

        /// <summary>
        /// Get current user's notification preferences
        /// </summary>
        [HttpGet("preferences")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetNotificationPreferences()
        {
            try
            {
                var userId = GetUserId();
                var preferences = await _notificationService.GetUserPreferencesAsync(userId);
                return Ok(preferences);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notification preferences for user");
                return StatusCode(500, new { message = "Error retrieving preferences" });
            }
        }

        /// <summary>
        /// Update current user's notification preferences
        /// </summary>
        [HttpPut("preferences")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> UpdateNotificationPreferences([FromBody] NotificationPreferencesDto preferences)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = GetUserId();
                preferences.UserId = userId; // Ensure the user can only update their own preferences
                
                await _notificationService.UpdateUserPreferencesAsync(userId, preferences);
                return Ok(new { message = "Notification preferences updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification preferences for user");
                return StatusCode(500, new { message = "Error updating preferences" });
            }
        }

        /// <summary>
        /// Get notification statistics for current user
        /// </summary>
        [HttpGet("stats")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetNotificationStats()
        {
            try
            {
                var userId = GetUserId();
                var stats = await _notificationService.GetNotificationStatsAsync(userId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notification statistics for user");
                return StatusCode(500, new { message = "Error retrieving statistics" });
            }
        }

        /// <summary>
        /// Get system-wide notification statistics (Admin only)
        /// </summary>
        [HttpGet("system-stats")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetSystemNotificationStats()
        {
            try
            {
                var stats = await _notificationService.GetSystemNotificationStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system notification statistics");
                return StatusCode(500, new { message = "Error retrieving system statistics" });
            }
        }

        /// <summary>
        /// Schedule a notification for later delivery (Admin only)
        /// </summary>
        [HttpPost("schedule")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ScheduleNotification([FromBody] ScheduleNotificationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (request.ScheduledTime <= DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Scheduled time must be in the future" });
                }

                await _notificationService.ScheduleNotificationAsync(
                    request.UserId, 
                    request.Title, 
                    request.Message, 
                    request.ScheduledTime);

                return Ok(new { message = "Notification scheduled successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling notification");
                return StatusCode(500, new { message = "Error scheduling notification" });
            }
        }

        /// <summary>
        /// Send test notification (Admin only - for testing purposes)
        /// </summary>
        [HttpPost("test")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> SendTestNotification([FromBody] TestNotificationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createRequest = new CreateNotificationRequest
                {
                    UserId = request.UserId,
                    Title = "Test Notification",
                    Message = request.Message ?? "This is a test notification from the system.",
                    Type = "Info",
                    Metadata = new Dictionary<string, object>
                    {
                        ["IsTest"] = true,
                        ["CreatedBy"] = GetUserId(),
                        ["CreatedAt"] = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                    }
                };

                var notification = await _notificationService.CreateNotificationAsync(createRequest);

                if (request.SendEmail)
                {
                    var emailNotification = new EmailNotificationDto
                    {
                        ToEmail = request.Email ?? "test@example.com",
                        ToName = "Test User",
                        Subject = "Test Email Notification",
                        Body = request.Message ?? "This is a test email notification.",
                        IsHtml = false
                    };

                    await _notificationService.SendEmailAsync(emailNotification);
                }

                return Ok(new { 
                    message = "Test notification sent successfully", 
                    notification = notification 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending test notification");
                return StatusCode(500, new { message = "Error sending test notification" });
            }
        }

        /// <summary>
        /// Cleanup old notifications (Admin only)
        /// </summary>
        [HttpPost("cleanup")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CleanupOldNotifications([FromQuery] int daysToKeep = 30)
        {
            try
            {
                if (daysToKeep < 1 || daysToKeep > 365)
                {
                    return BadRequest(new { message = "Days to keep must be between 1 and 365" });
                }

                await _notificationService.CleanupOldNotificationsAsync(daysToKeep);
                return Ok(new { message = $"Cleanup completed for notifications older than {daysToKeep} days" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up old notifications");
                return StatusCode(500, new { message = "Error cleaning up notifications" });
            }
        }

        #region Private Helper Methods

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        #endregion
    }
}