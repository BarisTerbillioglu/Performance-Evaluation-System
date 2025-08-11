using PerformanceEvaluation.Core.Entities;
using System.Security.Claims;

namespace PerformanceEvaluation.Infrastructure.Services.Interfaces
{
    // <summary>
    /// Infrastructure service interface for JWT token operations
    /// Handles external concerns like JWT generation and validation
    /// </summary>
    public interface ITokenService
    {
        /// <summary>
        /// Generates an access token for the authenticated user
        /// </summary>
        /// <param name="user">Authenticated user with roles</param>
        /// <returns>JWT access token string</returns>
        string GenerateAccessToken(User user);

        /// <summary>
        /// Generates a refresh token for the authenticated user
        /// </summary>
        /// <param name="user">Authenticated user</param>
        /// <returns>WT refresh token string</returns>
        string GenerateRefreshToken(User user);

        /// <summary>
        /// Validates and decodes an access token
        /// </summary>
        /// <param name="token">JWT token to validate</param>
        /// <returns>ClaimsPrincipal if valid, null if invalid</returns>
        ClaimsPrincipal? ValidateAccessToken(string token);

        /// <summary>
        /// Validates a refresh token and returns the associated user
        /// </summary>
        /// <param name="refreshToken">Refresh token to validate</param>
        /// <returns>User if token is valid, null if invalid</returns>
        Task<User?> ValidateRefreshTokenAsync(string refreshToken);

        /// <summary>
        /// Extracts user ID from a valid token
        /// </summary>
        /// <param name="token">JWT token</param>
        /// <returns>User ID if token is valid, null if invalid</returns>
        int? GetUserIdFromToken(string token);

        /// <summary>
        /// Checks if a token is expired
        /// </summary>
        /// <param name="token">JWT token to check</param>
        /// <returns>True if token is expired</returns>
        bool IsTokenExpired(string token);

        /// <summary>
        /// Invalidates a refresh token (for logout scenarios)
        /// </summary>
        /// <param name="refreshToken">Token to invalidate</param>
        /// <returns>True if successfully invalidated</returns>
        Task<bool> InvalidateRefreshTokenAsync(string refreshToken);
    }
}