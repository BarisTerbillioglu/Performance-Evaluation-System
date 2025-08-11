using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Enums;
using PerformanceEvaluation.Core.Interfaces;
using PerformanceEvaluation.Core.Models;
using PerformanceEvaluation.Infrastructure.Data;

namespace PerformanceEvaluation.Application.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuthService> _logger;

        public AuthService(ApplicationDbContext context, ILogger<AuthService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<AuthResult> ValidateUserCredentialsAsync(string email, string password)
        {
            try
            {

                if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                {
                    return AuthResult.Failure("Email and password are required", AuthFailureReason.InvalidCredentials);
                }

                var user = await _context.Users
                        .Include(u => u.RoleAssignments)
                        .ThenInclude(ur => ur.Role)
                        .Include(u => u.Department)
                        .FirstOrDefaultAsync(u => u.Email.Equals(email, StringComparison.CurrentCultureIgnoreCase));
                if (user == null)
                {
                    _logger.LogWarning("Login attempt with non-existing email: {Email}", email);
                    return AuthResult.Failure("Invalid email or password", AuthFailureReason.InvalidCredentials);
                }
                if (!user.IsActive)
                {
                    _logger.LogWarning("Login attempt with inactive account: {Email}", email);
                    return AuthResult.Failure("Account is inactive", AuthFailureReason.AccountInactive);
                }
                if (await ShouldLockAccountAsync(email))
                {
                    _logger.LogWarning("Account should be locked due to failed attempts: {Email}", email);
                    return AuthResult.Failure("Account is temporarily locked due to too many failed attempts", AuthFailureReason.TooManyAttempts);
                }
                if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                {
                    _logger.LogWarning("Failed login attempt for email: {Email}", email);
                    await RecordFailedLoginAsync(email, DateTime.UtcNow);
                    return AuthResult.Failure("Invalid email or password", AuthFailureReason.InvalidCredentials);
                }

                await RecordSuccessfulLoginAsync(user.ID, DateTime.UtcNow);
                _logger.LogInformation("Successful login for user: {UserId}", user.ID);

                return AuthResult.Success(user, "Authentication successful");
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "System error during authentication for email: {Email}", email);
                return AuthResult.Failure("System error occurred during authentication", AuthFailureReason.SystemError);
            }
        }

        public async Task<bool> IsUserActiveAsync(int userId)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.ID == userId);

                return user?.IsActive ?? false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user is active: {UserId}", userId);
                return false;
            }
        }

        public async Task RecordSuccessfulLoginAsync(int userId, DateTime loginTime)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.ID == userId);
                if (user != null)
                {
                    user.UpdatedDate = loginTime;
                    await _context.SaveChangesAsync();
                }

                 _logger.LogInformation("Recorded successful login for user {UserId} at {LoginTime}", userId, loginTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording successful login for user {UserId}", userId);
            }
        }

        public async Task RecordFailedLoginAsync(string email, DateTime attemptTime)
        {
            try
            {
                _logger.LogWarning("Recorded failed login attempt for email {Email} at {AttemptTime}", email, attemptTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording failed login for email {Email}", email);
            }
        }

        //Returns false 
        public async Task<bool> ShouldLockAccountAsync(string email)
        {
            try
            {
                //Locking account can be done according to business rules in the future.
                //For intance: FailedLoginAttempt entity, count attemps in last 15 minutes,
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

                if (user == null) return false;

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if account should be locked for email {Email}", email);
                return false;
            }
        }
    }
}