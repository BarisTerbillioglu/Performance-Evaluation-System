using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.Role;
using PerformanceEvaluation.Application.Services.Interfaces;

namespace PerformanceEvaluation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;
        private readonly ILogger<RoleController> _logger;

        public RoleController(
            IRoleService roleService,
            ILogger<RoleController> logger)
        {
            _roleService = roleService;
            _logger = logger;
        }

        /// <summary>
        /// Get all roles
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetRoles()
        {
            try
            {
                var roles = await _roleService.GetAllRolesAsync(User);
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving roles");
                return StatusCode(500, new { message = "Error retrieving roles" });
            }
        }

        /// <summary>
        /// Get role by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetRole(int id)
        {
            try
            {
                var role = await _roleService.GetRoleByIdAsync(id, User);
                if (role == null)
                {
                    return NotFound(new { message = "Role not found or not accessible" });
                }

                return Ok(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving role {RoleId}", id);
                return StatusCode(500, new { message = "Error retrieving role" });
            }
        }

        /// <summary>
        /// Get role by name
        /// </summary>
        [HttpGet("by-name/{name}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetRoleByName(string name)
        {
            try
            {
                var role = await _roleService.GetRoleByNameAsync(name, User);
                if (role == null)
                {
                    return NotFound(new { message = "Role not found or not accessible" });
                }

                return Ok(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving role by name {RoleName}", name);
                return StatusCode(500, new { message = "Error retrieving role" });
            }
        }

        /// <summary>
        /// Get system roles (Admin, Evaluator, Employee)
        /// </summary>
        [HttpGet("system")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetSystemRoles()
        {
            try
            {
                var roles = await _roleService.GetSystemRolesAsync(User);
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system roles");
                return StatusCode(500, new { message = "Error retrieving system roles" });
            }
        }

        /// <summary>
        /// Get job roles (Business Analyst, Developer, QA Specialist)
        /// </summary>
        [HttpGet("job")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetJobRoles()
        {
            try
            {
                var roles = await _roleService.GetJobRolesAsync(User);
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving job roles");
                return StatusCode(500, new { message = "Error retrieving job roles" });
            }
        }

        /// <summary>
        /// Create a new role (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var role = await _roleService.CreateRoleAsync(request, User);
                return CreatedAtAction(nameof(GetRole), new { id = role.Id }, role);
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
                _logger.LogError(ex, "Error creating role");
                return StatusCode(500, new { message = "Error creating role" });
            }
        }

        /// <summary>
        /// Update role (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var role = await _roleService.UpdateRoleAsync(id, request, User);
                if (role == null)
                {
                    return NotFound(new { message = "Role not found" });
                }

                return Ok(role);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
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
                _logger.LogError(ex, "Error updating role {RoleId}", id);
                return StatusCode(500, new { message = "Error updating role" });
            }
        }

        /// <summary>
        /// Deactivate role (soft delete)
        /// </summary>
        [HttpPatch("{id}/deactivate")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeactivateRole(int id)
        {
            try
            {
                var result = await _roleService.DeactivateRoleAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Role not found or already inactive" });
                }

                return Ok(new { message = "Role deactivated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating role {Id}", id);
                return StatusCode(500, new { message = "Error deactivating role" });
            }
        }

        /// <summary>
        /// Reactivate role
        /// </summary>
        [HttpPatch("{id}/reactivate")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ReactivateRole(int id)
        {
            try
            {
                var result = await _roleService.ReactivateRoleAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Role not found or already active" });
                }

                return Ok(new { message = "Role reactivated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating role {Id}", id);
                return StatusCode(500, new { message = "Error reactivating role" });
            }
        }

        /// <summary>
        /// Cascade deactivate role
        /// </summary>
        [HttpPatch("{id}/cascade-deactivate")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CascadeDeactivateRole(int id)
        {
            try
            {
                var result = await _roleService.CascadeDeactivateRoleAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Role not found" });
                }

                return Ok(new { message = "Role deactivated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cascade deactivating role {Id}", id);
                return StatusCode(500, new { message = "Error cascade deactivating role" });
            }
        }

        /// <summary>
        /// Permanently delete role
        /// </summary>
        [HttpDelete("{id}/permanent")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> PermanentlyDeleteRole(int id)
        {
            try
            {
                var result = await _roleService.DeleteRoleAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Role not found" });
                }

                return Ok(new { message = "Role permanently deleted" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error permanently deleting role {Id}", id);
                return StatusCode(500, new { message = "Error permanently deleting role" });
            }
        }

        /// <summary>
        /// Assign role to user (Admin only)
        /// </summary>
        [HttpPost("assign")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var assignment = await _roleService.AssignRoleToUserAsync(request, User);
                return Ok(assignment);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
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
                _logger.LogError(ex, "Error assigning role {RoleId} to user {UserId}", request.RoleId, request.UserId);
                return StatusCode(500, new { message = "Error assigning role" });
            }
        }

        /// <summary>
        /// Remove role from user (Admin only)
        /// </summary>
        [HttpDelete("users/{userId}/roles/{roleId}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> RemoveRoleFromUser(int userId, int roleId)
        {
            try
            {
                var result = await _roleService.RemoveRoleFromUserAsync(userId, roleId, User);
                if (!result)
                {
                    return NotFound(new { message = "Role assignment not found" });
                }

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing role {RoleId} from user {UserId}", roleId, userId);
                return StatusCode(500, new { message = "Error removing role assignment" });
            }
        }

        /// <summary>
        /// Get user's roles
        /// </summary>
        [HttpGet("users/{userId}/roles")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetUserRoles(int userId)
        {
            try
            {
                var roles = await _roleService.GetUserRolesAsync(userId, User);
                return Ok(roles);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving roles for user {UserId}", userId);
                return StatusCode(500, new { message = "Error retrieving user roles" });
            }
        }
    }
}