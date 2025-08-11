using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.Auth;
using PerformanceEvaluation.Application.Services.Interfaces;
using System.Security.Claims;

namespace PerformanceEvaluation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthApplicationService _authApplicationService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthApplicationService authApplicationService,
            ILogger<AuthController> logger)
        {
            _authApplicationService = authApplicationService;
            _logger = logger;
        }

        /// <summary>
        /// User login endpoint
        /// </summary>
        /// <param name="request">Login Credentials</param>
        /// <returns>User info and sets HTTP-only cookies</returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _authApplicationService.LoginAsync(request);

                if (!result.success)
                    return Unauthorized(new { message = result.message });

                if (!string.IsNullOrEmpty(result.AccessToken) && !string.IsNullOrEmpty(result.RefreshToken))
                {
                    SetTokenCookies(result.AccessToken, result.RefreshToken);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during login");
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        /// <summary>
        /// Get current user information
        /// </summary>
        /// <returns>Current user details</returns>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return BadRequest(new { message = "Invalid user ID in token" });
                }

                var userInfo = await _authApplicationService.GetCurrentUserAsync(userId);
                if (userInfo == null)
                {
                    return NotFound(new { message = "User not found or inactive" });
                }

                return Ok(userInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user info for user {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { message = "Error retrieving user information" });
            }
        }

        /// <summary>
        /// Refresh access token using refresh token
        /// </summary>
        /// <returns>New access token</returns>
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var refreshToken = Request.Cookies["refreshToken"];
                
                if (string.IsNullOrEmpty(refreshToken))
                {
                    return Unauthorized(new { message = "Refresh token not found" });
                }

                var result = await _authApplicationService.RefreshTokenAsync(refreshToken);
                
                if (!result.IsSuccess)
                {
                    return Unauthorized(new { message = result.Message });
                }

                // Set new tokens in cookies
                SetTokenCookies(result.AccessToken, result.RefreshToken);

                return Ok(new 
                { 
                    message = result.Message,
                    expiresAt = result.ExpiresAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                return StatusCode(500, new { message = "Error refreshing token" });
            }
        }

        /// <summary>
        /// Logout and clear cookies
        /// </summary>
        /// <returns>Logout confirmation</returns>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var refreshToken = Request.Cookies["refreshToken"];

                if (int.TryParse(userIdClaim, out int userId))
                {
                    await _authApplicationService.LogoutAsync(userId, refreshToken);
                    _logger.LogInformation("User {UserId} logged out", userId);
                }

                ClearTokenCookies();
                
                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, new { message = "An error occurred during logout" });
            }
        }

        #region Private Helper Methods

        /// <summary>
        /// Sets JWT tokens as HTTP-only cookies
        /// </summary>
        private void SetTokenCookies(string accessToken, string refreshToken)
        {
            var accessTokenOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Set to false for development if not using HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(15) // Match access token expiry
            };

            var refreshTokenOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Set to false for development if not using HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(8) // Match refresh token expiry
            };

            Response.Cookies.Append("accessToken", accessToken, accessTokenOptions);
            Response.Cookies.Append("refreshToken", refreshToken, refreshTokenOptions);
        }

        /// <summary>
        /// Clears authentication cookies
        /// </summary>
        private void ClearTokenCookies()
        {
            Response.Cookies.Delete("accessToken");
            Response.Cookies.Delete("refreshToken");
        }

        #endregion
    }
}