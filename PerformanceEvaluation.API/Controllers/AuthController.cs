using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PerformanceEvaluation.Infrastructure.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

using  PerformanceEvaluation.Application.Auth;
using PerformanceEvaluation.Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace PerformanceEvaluation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        public AuthController(ApplicationDbContext context, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// User login endpoint
        /// </summary>
        /// <param name="request">Login Credentials</param>
        /// <returns> User info and http only cookies</returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Application.Auth.LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState); //400

                var user = await _context.Users
                    .Include(u => u.RoleAssignments)
                    .ThenInclude(ur => ur.Role)
                    .Include(u => u.Department)
                    .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Failed login attempt for email: {Email}", request.Email);
                    return Unauthorized(new { message = "Invalid email or password" }); //401
                }

                var accessToken = GenerateAccessToken(user);
                var refreshToken = GenerateRefreshToken(user);

                SetTokenCookies(accessToken, refreshToken);

                _logger.LogInformation("User {UserID} logged in successfully", user.ID);

                return Ok(new LoginResponse
                {
                    success = true,
                    message = "Login successful",
                    User = new UserInfo
                    {
                        ID = user.ID,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Email = user.Email,
                        DepartmentID = user.DepartmentID,
                        RoleAssignments = user.RoleAssignments
                    }
                });
            }
            catch (Exception ex) //Unknown error
            {
                _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        /// <summary>
        /// Logout and clear cookies
        /// </summary>
        /// <returns>Logout Confirmation</returns>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userIDClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIDClaim, out int ID))
                {
                    _logger.LogInformation("User {ID} logged out", ID);
                }

                ClearTokenCookies();

                return Ok(new {message = "Logged out successfully"});
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, new { message = "An error occurred during logout" });
            }
        }

        #region Private Methods
        private string GenerateAccessToken(User user)
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

        private string GenerateRefreshToken(PerformanceEvaluation.Core.Entities.User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("ID", user.ID.ToString()),
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

        private async Task<User?> ValidateRefreshToken(string refreshToken)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var secretKey = jwtSettings["SecretKey"];
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

                handler.ValidateToken(refreshToken, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = key,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwt = (JwtSecurityToken)validatedToken;

                var tokenType = jwt.Claims.FirstOrDefault(x => x.Type == "tokenType")?.Value;
                if (tokenType != "refresh")
                {
                    return null;
                }

                var userIDClaim = jwt.Claims.FirstOrDefault(x => x.Type == "ID")?.Type;
                if (int.TryParse(userIDClaim, out int ID))
                {
                    return await _context.Users
                        .Include(u => u.RoleAssignments)
                        .ThenInclude(ur => ur.Role)
                        .Include(u => u.Department)
                        .FirstOrDefaultAsync(u => u.ID == ID && u.IsActive);
                }
                return null;
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error validating refresh token");
                return null;
            }
        }

        private void SetTokenCookies(string accessToken, string refreshToken)
        {

        }

        private void SetAccessTokenCookie(string accessToken)
        {

        }

        private void SetRefreshTokenCookie(string refreshToken)
        {

        }

        private void ClearTokenCookies()
        {

        }

        #endregion
    }
}