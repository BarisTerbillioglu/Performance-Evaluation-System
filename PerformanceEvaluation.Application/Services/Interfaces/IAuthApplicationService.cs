using PerformanceEvaluation.Application.DTOs.Auth;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface IAuthApplicationService
    {
        /// <summary>
        /// Handles user login use case
        /// </summary>
        /// <param name="request">Login credentials</param>
        /// <returns>Login response with user info and success status</returns>
        Task<LoginResponse> LoginAsync(LoginRequest request);

        /// <summary>
        /// Handles token refresh use case
        /// </summary>
        /// <param name="refreshToken">Current refresh token</param>
        /// <returns>Token refresh result with new tokens</returns>
        Task<TokenRefreshResult> RefreshTokenAsync(string refreshToken);

        /// <summary>
        /// Gets current user information
        /// </summary>
        /// <param name="userId">User ID from token claims</param>
        /// <returns>Current user details</returns>
        Task<UserInfo?> GetCurrentUserAsync(int userId);

        /// <summary>
        /// Handles user logout use case
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="refreshToken">Refresh token to invalidate</param>
        /// <returns>True if logout was successful</returns>
        Task<bool> LogoutAsync(int userId, string? refreshToken);

    }

    public class TokenRefreshResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }

        public static TokenRefreshResult Success(string accessToken, string refreshToken, DateTime expiresAt)
        {
            return new TokenRefreshResult
            {
                IsSuccess = true,
                Message = "Token refreshed successfully",
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt
            };
        }

        public static TokenRefreshResult Failed(string message)
        {
            return new TokenRefreshResult
            {
                IsSuccess = false,
                Message = message,
                AccessToken = string.Empty,
                RefreshToken = string.Empty,
                ExpiresAt = DateTime.MinValue
            };
        }


    }
}