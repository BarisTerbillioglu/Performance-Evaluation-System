using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.Department;
using PerformanceEvaluation.Application.Services.Interfaces;

namespace PerformanceEvaluation.API.Controllers
{
    /// <summary>
    /// 
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class DepartmentController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;
        private readonly ILogger<DepartmentController> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="departmentService"></param>
        /// <param name="logger"></param>
        public DepartmentController(
            IDepartmentService departmentService,
            ILogger<DepartmentController> logger)
        {
            _departmentService = departmentService;
            _logger = logger;
        }

        /// <summary>
        /// Get all departments
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetDepartments()
        {
            try
            {
                var departments = await _departmentService.GetAllDepartmentsAsync(User);
                return Ok(departments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving departments");
                return StatusCode(500, new { message = "Error retrieving departments" });
            }
        }

        /// <summary>
        /// Get department by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetDepartment(int id)
        {
            try
            {
                var department = await _departmentService.GetDepartmentByIdAsync(id, User);
                if (department == null)
                {
                    return NotFound(new { message = "Department not found or not accessible" });
                }

                return Ok(department);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving department {DepartmentId}", id);
                return StatusCode(500, new { message = "Error retrieving department" });
            }
        }

        /// <summary>
        /// Create a new department (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var department = await _departmentService.CreateDepartmentAsync(request, User);
                return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating department");
                return StatusCode(500, new { message = "Error creating department" });
            }
        }

        /// <summary>
        /// Update department (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateDepartment(int id, [FromBody] UpdateDepartmentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var department = await _departmentService.UpdateDepartmentAsync(id, request, User);
                if (department == null)
                {
                    return NotFound(new { message = "Department not found" });
                }

                return Ok(department);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating department {DepartmentId}", id);
                return StatusCode(500, new { message = "Error updating department" });
            }
        }

        /// <summary>
        /// Deactivate department (soft delete)
        /// </summary>
        [HttpPatch("{id}/deactivate")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeactivateDepartment(int id)
        {
            try
            {
                var result = await _departmentService.DeactivateDepartmentAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Department not found or already inactive" });
                }

                return Ok(new { message = "Department deactivated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating department {Id}", id);
                return StatusCode(500, new { message = "Error deactivating department" });
            }
        }

        /// <summary>
        /// Reactivate department
        /// </summary>
        [HttpPatch("{id}/reactivate")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ReactivateDepartment(int id)
        {
            try
            {
                var result = await _departmentService.ReactivateDepartmentAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Department not found or already active" });
                }

                return Ok(new { message = "Department reactivated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating department {Id}", id);
                return StatusCode(500, new { message = "Error reactivating department" });
            }
        }

        /// <summary>
        /// Cascade deactivate department
        /// </summary>
        [HttpPatch("{id}/cascade-deactivate")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CascadeDeactivateDepartment(int id)
        {
            try
            {
                var result = await _departmentService.CascadeDeactivateDepartmentAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Department not found" });
                }

                return Ok(new { message = "Department deactivated successfully" });
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
                _logger.LogError(ex, "Error cascade deactivating department {Id}", id);
                return StatusCode(500, new { message = "Error cascade deactivating department" });
            }
        }

        /// <summary>
        /// Permanently delete department
        /// </summary>
        [HttpDelete("{id}/permanent")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> PermanentlyDeleteDepartment(int id)
        {
            try
            {
                var result = await _departmentService.DeleteDepartmentAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Department not found" });
                }

                return Ok(new { message = "Department permanently deleted" });
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
                _logger.LogError(ex, "Error permanently deleting department {Id}", id);
                return StatusCode(500, new { message = "Error permanently deleting department" });
            }
        }

        /// <summary>
        /// Get department with users
        /// </summary>
        [HttpGet("{id}/users")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> GetDepartmentWithUsers(int id)
        {
            try
            {
                var department = await _departmentService.GetDepartmentWithUsersAsync(id, User);
                if (department == null)
                {
                    return NotFound(new { message = "Department not found or not accessible" });
                }

                return Ok(department);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving department {DepartmentId} with users", id);
                return StatusCode(500, new { message = "Error retrieving department with users" });
            }
        }

        /// <summary>
        /// Get current user's department
        /// </summary>
        [HttpGet("my-department")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetMyDepartment()
        {
            try
            {
                var department = await _departmentService.GetMyDepartmentAsync(User);
                if (department == null)
                {
                    return NotFound(new { message = "Department not found" });
                }

                return Ok(department);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current user's department");
                return StatusCode(500, new { message = "Error retrieving department" });
            }
        }

        /// <summary>
        /// Get department statistics
        /// </summary>
        [HttpGet("{id}/stats")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> GetDepartmentStats(int id)
        {
            try
            {
                var stats = await _departmentService.GetDepartmentStatsAsync(id, User);
                return Ok(stats);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving department {DepartmentId} statistics", id);
                return StatusCode(500, new { message = "Error retrieving department statistics" });
            }
        }
    }
}