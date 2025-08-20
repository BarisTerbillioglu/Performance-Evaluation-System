using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.Team;
using PerformanceEvaluation.Application.Services.Interfaces;

namespace PerformanceEvaluation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class TeamController : ControllerBase
    {
        private readonly ITeamService _teamService;
        private readonly ILogger<TeamController> _logger;

        public TeamController(
            ITeamService teamService,
            ILogger<TeamController> logger)
        {
            _teamService = teamService;
            _logger = logger;
        }

        /// <summary>
        /// Get all teams
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetTeams()
        {
            try
            {
                var teams = await _teamService.GetAllTeamsAsync(User);
                return Ok(teams);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving teams");
                return StatusCode(500, new { message = "Error retrieving teams" });
            }
        }

        /// <summary>
        /// Get team by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetTeam(int id)
        {
            try
            {
                var team = await _teamService.GetTeamByIdAsync(id, User);
                if (team == null)
                {
                    return NotFound(new { message = "Team not found or not accessible" });
                }

                return Ok(team);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving team {TeamId}", id);
                return StatusCode(500, new { message = "Error retrieving team" });
            }
        }

        /// <summary>
        /// Create new team (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CreateTeam([FromBody] CreateTeamRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var team = await _teamService.CreateTeamAsync(request, User);
                return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, team);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating team");
                return StatusCode(500, new { message = "Error creating team" });
            }
        }

        /// <summary>
        /// Update team (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateTeam(int id, [FromBody] UpdateTeamRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var team = await _teamService.UpdateTeamAsync(id, request, User);
                if (team == null)
                {
                    return NotFound(new { message = "Team not found" });
                }

                return Ok(team);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating team {TeamId}", id);
                return StatusCode(500, new { message = "Error updating team" });
            }
        }

        /// <summary>
        /// Deactivate team (soft delete)
        /// </summary>
        [HttpPatch("{id}/deactivate")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeactivateTeam(int id)
        {
            try
            {
                var result = await _teamService.DeactivateTeamAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Team not found or already inactive" });
                }

                return Ok(new { message = "Team deactivated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating team {TeamId}", id);
                return StatusCode(500, new { message = "Error deactivating team" });
            }
        }

        /// <summary>
        /// Reactivate team
        /// </summary>
        [HttpPatch("{id}/reactivate")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ReactivateTeam(int id)
        {
            try
            {
                var result = await _teamService.ReactivateTeamAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Team not found or already active" });
                }

                return Ok(new { message = "Team reactivated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating team {TeamId}", id);
                return StatusCode(500, new { message = "Error reactivating team" });
            }
        }

        /// <summary>
        /// Cascade deactivate team and all assignments
        /// </summary>
        [HttpPatch("{id}/cascade-deactivate")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CascadeDeactivateTeam(int id)
        {
            try
            {
                var result = await _teamService.CascadeDeactivateTeamAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Team not found" });
                }

                return Ok(new { message = "Team and assignments deactivated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cascade deactivating team {TeamId}", id);
                return StatusCode(500, new { message = "Error cascade deactivating team" });
            }
        }

        /// <summary>
        /// Permanently delete team (Admin only - use with caution)
        /// </summary>
        [HttpDelete("{id}/permanent")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> PermanentlyDeleteTeam(int id)
        {
            try
            {
                var result = await _teamService.DeleteTeamAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Team not found" });
                }

                return Ok(new { message = "Team permanently deleted" });
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
                _logger.LogError(ex, "Error permanently deleting team {TeamId}", id);
                return StatusCode(500, new { message = "Error permanently deleting team" });
            }
        }

        /// <summary>
        /// Get team with members
        /// </summary>
        [HttpGet("{id}/members")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> GetTeamWithMembers(int id)
        {
            try
            {
                var team = await _teamService.GetTeamWithMembersAsync(id, User);
                if (team == null)
                {
                    return NotFound(new { message = "Team not found or not accessible" });
                }

                return Ok(team);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving team {TeamId} with members", id);
                return StatusCode(500, new { message = "Error retrieving team with members" });
            }
        }

        /// <summary>
        /// Assign evaluator to team (Admin only)
        /// </summary>
        [HttpPost("{teamId}/evaluators")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> AssignEvaluatorToTeam(int teamId, [FromBody] AssignEvaluatorRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Ensure the teamId matches the request
                if (request.TeamId != teamId)
                {
                    return BadRequest(new { message = "Team ID mismatch" });
                }

                var assignment = await _teamService.AssignEvaluatorToTeamAsync(request, User);
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
                _logger.LogError(ex, "Error assigning evaluator {EvaluatorId} to team {TeamId}", request.EvaluatorId, teamId);
                return StatusCode(500, new { message = "Error assigning evaluator to team" });
            }
        }

        /// <summary>
        /// Assign employee to team (Admin only)
        /// </summary>
        [HttpPost("{teamId}/employees")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> AssignEmployeeToTeam(int teamId, [FromBody] AssignEmployeeRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Ensure the teamId matches the request
                if (request.TeamId != teamId)
                {
                    return BadRequest(new { message = "Team ID mismatch" });
                }

                var assignment = await _teamService.AssignEmployeeToTeamAsync(request, User);
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
                _logger.LogError(ex, "Error assigning employee {EmployeeId} to team {TeamId}", request.EmployeeId, teamId);
                return StatusCode(500, new { message = "Error assigning employee to team" });
            }
        }

        /// <summary>
        /// Remove user from team (Admin only)
        /// </summary>
        [HttpDelete("{teamId}/users/{userId}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> RemoveUserFromTeam(int teamId, int userId)
        {
            try
            {
                var result = await _teamService.RemoveUserFromTeamAsync(teamId, userId, User);
                if (!result)
                {
                    return NotFound(new { message = "User assignment not found in team" });
                }

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing user {UserId} from team {TeamId}", userId, teamId);
                return StatusCode(500, new { message = "Error removing user from team" });
            }
        }

        /// <summary>
        /// Get team assignments
        /// </summary>
        [HttpGet("{teamId}/assignments")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> GetTeamAssignments(int teamId)
        {
            try
            {
                var assignments = await _teamService.GetTeamAssignmentsAsync(teamId, User);
                return Ok(assignments);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving assignments for team {TeamId}", teamId);
                return StatusCode(500, new { message = "Error retrieving team assignments" });
            }
        }
    }
}