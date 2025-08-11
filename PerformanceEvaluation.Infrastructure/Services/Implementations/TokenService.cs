using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Services.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Services.Implementations
{
    /// <summary>
    /// Infrastructure service implementation for JWT token operations
    /// Handles JWT creation, validation, and refresh token management
    /// </summary>
    public class TokenService : ITokenService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<TokenService> _logger;
        public TokenService(ApplicationDbContext context, IConfiguration configuration, ILogger<TokenService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public string GenerateAccessToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var key = new SymmetricSecurityKey(keyBytes);
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.ID.ToString()),
                new Claim(ClaimTypes.Name, $"{user.FirstName}{user.LastName}"),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("DepartmentID", user.DepartmentID.ToString())
            };

            // Add system role to the claims id <= 3
            foreach (var RoleAssignments in user.RoleAssignments.Where(ur => ur.RoleID <= 3))
            {
                claims.Add(new Claim(ClaimTypes.Role, RoleAssignments.Role.Name));
            }

            //Add job role to the claims. id > 3
            foreach (var RoleAssignments in user.RoleAssignments.Where(ur => ur.RoleID > 3))
            {
                claims.Add(new Claim("jobPosition", RoleAssignments.Role.Name));
            }

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken(PerformanceEvaluation.Core.Entities.User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("userId", user.ID.ToString()),
                new Claim("tokenType", "refresh"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat,
                    new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(),
                    ClaimValueTypes.Integer64)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal? ValidateAccessToken(string token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = key,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = handler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return principal;
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "Token validation failed for token");
                return null;
            }
        }

        public async Task<User?> ValidateRefreshTokenAsync(string refreshToken)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = key,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = handler.ValidateToken(refreshToken, validationParameters, out SecurityToken validatedToken);
                var jwt = (JwtSecurityToken)validatedToken;

                var tokenType = jwt.Claims.FirstOrDefault(x => x.Type == "tokenType")?.Value;
                if (tokenType != "refresh")
                {
                    _logger.LogWarning("Invalid token type for refresh: {tokenType}", tokenType);
                    return null;
                }

                var userIdClaim = jwt.Claims.FirstOrDefault(x => x.Type == "userId")?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    _logger.LogWarning("Invalid user ID in refresh token: {userIdClaim}", userIdClaim);
                    return null;
                }

                var user = await _context.Users
                    .Include(u => u.RoleAssignments)
                    .ThenInclude(ur => ur.Role)
                    .Include(u => u.Department)
                    .FirstOrDefaultAsync(u => u.ID == userId && u.IsActive);

                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating refresh token");
                return null;
            }
        }

        public int? GetUserIdFromToken(string token)
        {
            try
            {
                var principal = ValidateAccessToken(token);
                var userIDClaim = principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIDClaim, out int userID))
                {
                    return userID;
                }
                return null;
            }
            catch
            {
                return null;
            }
        }

        public bool IsTokenExpired(string token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwt = handler.ReadJwtToken(token);

                return jwt.ValidTo < DateTime.UtcNow;
            }
            catch
            {
                return true;
            }
        }

        public async Task<bool> InvalidateRefreshTokenAsync(string refreshToken)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = key,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = handler.ValidateToken(refreshToken, validationParameters, out SecurityToken validatedToken);
                var jwt = (JwtSecurityToken)validatedToken;

                var userIdClaim = jwt.Claims.FirstOrDefault(x => x.Type == "userId")?.Value;
                if (int.TryParse(userIdClaim, out int userID))
                {
                    _logger.LogInformation("Refresh token invalidated for user {userId}", userID);
                    return true;
                }
                _logger.LogWarning("Attempted to invalidate invalid refresh token");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating refresh token");
                return false;
            }
        }
    }
}