using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Application.DTOs.Auth;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Core.Interfaces;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Services.Interfaces;

namespace PerformanceEvaluation.Application.Services.Implementations
{
    public class AuthApplicationService : IAuthApplicationService
    {
        private readonly IAuthService _authService;
        private readonly ITokenService _tokenService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuthApplicationService> _logger;

        public AuthApplicationService(
            IAuthService authService,
            ITokenService tokenService,
            ApplicationDbContext context,
            ILogger<AuthApplicationService> logger)
        {
            _authService = authService;
            _tokenService = tokenService;
            _context = context;
            _logger = logger;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            try
            {
                _logger.LogInformation("Login attempt for email: {Email}", request.Email);

                var authResult = await _authService.ValidateUserCredentialsAsync(request.Email, request.Password);

                if (!authResult.IsSuccess || authResult.User == null)
                {
                    return new LoginResponse
                    {
                        success = false,
                        message = authResult.Message,
                        User = null!
                    };
                }

                var accessToken = _tokenService.GenerateAccessToken(authResult.User);
                var refreshToken = _tokenService.GenerateRefreshToken(authResult.User);

                var userInfo = new UserInfo
                {
                    ID = authResult.User.ID,
                    FirstName = authResult.User.FirstName,
                    LastName = authResult.User.LastName,
                    Email = authResult.User.Email,
                    DepartmentID = authResult.User.DepartmentID,
                    RoleIds = authResult.User.RoleAssignments.Select(ra => ra.RoleID).ToList()

                };

                _logger.LogInformation("Successful login for user: {UserId}", authResult.User.ID);

                return new LoginResponse
                {
                    success = true,
                    message = authResult.Message,
                    User = userInfo,
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15)
                };

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login process for email: {Email}", request.Email);
                return new LoginResponse
                {
                    success = false,
                    message = "An error occurred during login",
                    User = null!,
                    AccessToken = null,
                    RefreshToken = null
                };
            }
        }
        
        public async Task<TokenRefreshResult> RefreshTokenAsync(string refreshToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(refreshToken))
                {
                    return TokenRefreshResult.Failed("Refresh token is required");
                }

                var user = await _tokenService.ValidateRefreshTokenAsync(refreshToken);

                if (user == null)
                {
                    _logger.LogWarning("Invalid refresh token provided");
                    return TokenRefreshResult.Failed("Invalid refresh token");
                }

                else if (!await _authService.IsUserActiveAsync(user.ID))
                {
                    _logger.LogWarning("Refresh token used for inactive user: {UserId}", user.ID);
                    return TokenRefreshResult.Failed("User account is inactive");
                }

                else
                {
                    var newAccesstoken = _tokenService.GenerateAccessToken(user);
                    var newRefreshtoken = _tokenService.GenerateRefreshToken(user);

                    _logger.LogInformation("Tokens refreshed for user: {UserId}", user.ID);

                    return TokenRefreshResult.Success(newAccesstoken, newRefreshtoken, DateTime.UtcNow.AddMinutes(15));
                }
                
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return TokenRefreshResult.Failed("An error occurred during token refresh");
            }
        }
        
        public async Task<UserInfo?> GetCurrentUserAsync(int userId)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.RoleAssignments)
                    .ThenInclude(ur => ur.Role)
                    .Include(u => u.Department)
                    .FirstOrDefaultAsync(u => u.ID == userId && u.IsActive);

                if (user == null)
                {
                    _logger.LogWarning("Current user request for non-existent or inactive user: {UserId}", userId);
                    return null;
                }

                return new UserInfo
                {
                    ID = user.ID,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    DepartmentID = user.DepartmentID,
                    RoleIds = user.RoleAssignments.Select(ra => ra.RoleID).ToList()

                };
                
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user info for user: {UserId}", userId);
                return null;
            }
        }
        
        public async Task<bool> LogoutAsync(int userId, string? refreshToken)
        {
            try
            {
                _logger.LogInformation("Logout requested for user: {UserId}", userId);

                if (!string.IsNullOrWhiteSpace(refreshToken))
                {
                    await _tokenService.InvalidateRefreshTokenAsync(refreshToken);
                }

                _logger.LogInformation("User logged out successfully: {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout for user: {UserId}", userId);
                return false;
            }
        }

    }
}