using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.User;
using PerformanceEvaluation.Application.Services.Interfaces;
using System.Security.Claims;

namespace PerformanceEvaluation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(
            IUserService userService,
            ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// Get all users (role-based filtering applied)
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _userService.GetUserListAsync(User);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, new { message = "Error retrieving users" });
            }
        }

        /// <summary>
        /// Get user by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetUser(int id)
        {
            try
            {
                var user = await _userService.GetUserDetailsAsync(id, User);
                if (user == null)
                {
                    return NotFound(new { message = "User not found or not accessible" });
                }

                return Ok(user);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {UserId}", id);
                return StatusCode(500, new { message = "Error retrieving user" });
            }
        }

        /// <summary>
        /// Create a new user (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var user = await _userService.CreateUserAsync(request, User);
                return CreatedAtAction(nameof(GetUser), new { id = user.ID }, user);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, new { message = "Error creating user" });
            }
        }

        /// <summary>
        /// Update user (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var user = await _userService.UpdateUserAsync(id, request, User);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(user);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return StatusCode(500, new { message = "Error updating user" });
            }
        }

        /// <summary>
        /// Delete user (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var result = await _userService.DeleteUserAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "User not found" });
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return StatusCode(500, new { message = "Error deleting user" });
            }
        }

        /// <summary>
        /// Get evaluators list
        /// </summary>
        [HttpGet("evaluators")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> GetEvaluators()
        {
            try
            {
                var evaluators = await _userService.GetEvaluatorListAsync(User);
                return Ok(evaluators);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving evaluators");
                return StatusCode(500, new { message = "Error retrieving evaluators" });
            }
        }

        /// <summary>
        /// Get employees list
        /// </summary>
        [HttpGet("employees")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> GetEmployees()
        {
            try
            {
                var employees = await _userService.GetEmployeeListAsync(User);
                return Ok(employees);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving employees");
                return StatusCode(500, new { message = "Error retrieving employees" });
            }
        }

        /// <summary>
        /// Get employees in a specific department
        /// </summary>
        [HttpGet("departments/{departmentId}/employees")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> GetEmployeesInDepartment(int departmentId)
        {
            try
            {
                var employees = await _userService.GetEmployeeListInADepartmentAsync(departmentId, User);
                return Ok(employees);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving employees for department {DepartmentId}", departmentId);
                return StatusCode(500, new { message = "Error retrieving employees" });
            }
        }

        /// <summary>
        /// Get users in a specific team
        /// </summary>
        [HttpGet("teams/{teamId}/users")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> GetUsersInTeam(int teamId)
        {
            try
            {
                var users = await _userService.GetUserListInATeamAsync(teamId, User);
                return Ok(users);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users for team {TeamId}", teamId);
                return StatusCode(500, new { message = "Error retrieving team users" });
            }
        }

        /// <summary>
        /// Change user password
        /// </summary>
        [HttpPost("{id}/change-password")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _userService.ChangePasswordAsync(id, request, User);
                if (!result)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new { message = "Password changed successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {UserId}", id);
                return StatusCode(500, new { message = "Error changing password" });
            }
        }
    }
}