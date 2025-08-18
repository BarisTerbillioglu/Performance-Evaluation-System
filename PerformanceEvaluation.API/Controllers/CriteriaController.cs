using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.Criteria;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class CriteriaController : ControllerBase
    {
        private readonly ICriteriaService _criteriaService;
        private readonly ILogger<CriteriaController> _logger;

        public CriteriaController(
            ICriteriaService criteriaService,
            ILogger<CriteriaController> logger)
        {
            _criteriaService = criteriaService;
            _logger = logger;
        }

        /// <summary>
        /// Get all criteria
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetCriteria()
        {
            try
            {
                var criteria = await _criteriaService.GetAllCriteriaAsync(User);
                return Ok(criteria);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving criteria");
                return StatusCode(500, new { message = "Error retrieving criteria" });
            }
        }

        /// <summary>
        /// Get criteria by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetCriteria(int id)
        {
            try
            {
                var criteria = await _criteriaService.GetCriteriaByIdAsync(id, User);
                if (criteria == null)
                {
                    return NotFound(new { message = "Criteria not found or not accessible" });
                }

                return Ok(criteria);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving criteria {CriteriaId}", id);
                return StatusCode(500, new { message = "Error retrieving criteria" });
            }
        }

        /// <summary>
        /// Create new criteria (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CreateCriteria([FromBody] CreateCriteriaRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var criteria = await _criteriaService.CreateCriteriaAsync(request, User);
                return CreatedAtAction(nameof(GetCriteria), new { id = criteria.Id }, criteria);
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
                _logger.LogError(ex, "Error creating criteria");
                return StatusCode(500, new { message = "Error creating criteria" });
            }
        }

        /// <summary>
        /// Update criteria (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateCriteria(int id, [FromBody] UpdateCriteriaRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var criteria = await _criteriaService.UpdateCriteriaAsync(id, request, User);
                if (criteria == null)
                {
                    return NotFound(new { message = "Criteria not found" });
                }

                return Ok(criteria);
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
                _logger.LogError(ex, "Error updating criteria {CriteriaId}", id);
                return StatusCode(500, new { message = "Error updating criteria" });
            }
        }

        /// <summary>
        /// Delete criteria (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteCriteria(int id)
        {
            try
            {
                var result = await _criteriaService.DeleteCriteriaAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Criteria not found" });
                }

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting criteria {CriteriaId}", id);
                return StatusCode(500, new { message = "Error deleting criteria" });
            }
        }

        /// <summary>
        /// Get criteria by category
        /// </summary>
        [HttpGet("categories/{categoryId}/criteria")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetCriteriaByCategory(int categoryId)
        {
            try
            {
                var criteria = await _criteriaService.GetCriteriaByCategoryAsync(categoryId, User);
                return Ok(criteria);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving criteria for category {CategoryId}", categoryId);
                return StatusCode(500, new { message = "Error retrieving criteria" });
            }
        }

        /// <summary>
        /// Get criteria for specific roles
        /// </summary>
        [HttpGet("for-roles")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetCriteriaForRoles([FromQuery] SystemRole systemRole, [FromQuery] JobRoleType jobRole)
        {
            try
            {
                var criteria = await _criteriaService.GetCriteriaForRoleAsync(systemRole, jobRole, User);
                return Ok(criteria);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving criteria for roles SystemRole: {SystemRole}, JobRole: {JobRole}", systemRole, jobRole);
                return StatusCode(500, new { message = "Error retrieving criteria for roles" });
            }
        }

        /// <summary>
        /// Get criteria with role-specific description
        /// </summary>
        [HttpGet("{criteriaId}/roles/{roleId}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetCriteriaWithRoleDescription(int criteriaId, int roleId)
        {
            try
            {
                var criteria = await _criteriaService.GetCriteriaWithRoleDescriptionAsync(criteriaId, roleId, User);
                if (criteria == null)
                {
                    return NotFound(new { message = "Criteria not found or no description for this role" });
                }

                return Ok(criteria);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving criteria {CriteriaId} with role {RoleId} description", criteriaId, roleId);
                return StatusCode(500, new { message = "Error retrieving criteria with role description" });
            }
        }

        /// <summary>
        /// Get active criteria for evaluations
        /// </summary>
        [HttpGet("active-for-evaluation")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> GetActiveCriteriaForEvaluation()
        {
            try
            {
                var criteria = await _criteriaService.GetActiveCriteriaForEvaluationAsync();
                return Ok(criteria);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active criteria for evaluation");
                return StatusCode(500, new { message = "Error retrieving criteria for evaluation" });
            }
        }

        /// <summary>
        /// Add role-specific description to criteria (Admin only)
        /// </summary>
        [HttpPost("{criteriaId}/role-descriptions")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> AddRoleDescription(int criteriaId, [FromBody] AddRoleDescriptionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Ensure the criteriaId matches the request
                if (request.CriteriaId != criteriaId)
                {
                    return BadRequest(new { message = "Criteria ID mismatch" });
                }

                var roleDescription = await _criteriaService.AddRoleDescriptionAsync(request, User);
                return CreatedAtAction(nameof(GetCriteriaWithRoleDescription), 
                    new { criteriaId = criteriaId, roleId = request.RoleId }, roleDescription);
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
                _logger.LogError(ex, "Error adding role description to criteria {CriteriaId}", criteriaId);
                return StatusCode(500, new { message = "Error adding role description" });
            }
        }

        /// <summary>
        /// Update role-specific description (Admin only)
        /// </summary>
        [HttpPut("role-descriptions/{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateRoleDescription(int id, [FromBody] UpdateRoleDescriptionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var roleDescription = await _criteriaService.UpdateRoleDescriptionAsync(id, request, User);
                if (roleDescription == null)
                {
                    return NotFound(new { message = "Role description not found" });
                }

                return Ok(roleDescription);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role description {DescriptionId}", id);
                return StatusCode(500, new { message = "Error updating role description" });
            }
        }

        /// <summary>
        /// Delete role-specific description (Admin only)
        /// </summary>
        [HttpDelete("role-descriptions/{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteRoleDescription(int id)
        {
            try
            {
                var result = await _criteriaService.DeleteRoleDescriptionAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Role description not found" });
                }

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting role description {DescriptionId}", id);
                return StatusCode(500, new { message = "Error deleting role description" });
            }
        }
    }
}