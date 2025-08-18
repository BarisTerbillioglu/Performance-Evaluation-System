using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.CriteriaCategory;
using PerformanceEvaluation.Application.Services.Interfaces;

namespace PerformanceEvaluation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class CriteriaCategoryController : ControllerBase
    {
        private readonly ICriteriaCategoryService _categoryService;
        private readonly ILogger<CriteriaCategoryController> _logger;

        public CriteriaCategoryController(
            ICriteriaCategoryService categoryService,
            ILogger<CriteriaCategoryController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        /// <summary>
        /// Get all criteria categories
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllCategoriesAsync(User);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving criteria categories");
                return StatusCode(500, new { message = "Error retrieving criteria categories" });
            }
        }

        /// <summary>
        /// Get category by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetCategory(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id, User);
                if (category == null)
                {
                    return NotFound(new { message = "Category not found or not accessible" });
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category {CategoryId}", id);
                return StatusCode(500, new { message = "Error retrieving category" });
            }
        }

        /// <summary>
        /// Create new criteria category (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCriteriaCategoryRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var category = await _categoryService.CreateCategoryAsync(request, User);
                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
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
                _logger.LogError(ex, "Error creating criteria category");
                return StatusCode(500, new { message = "Error creating criteria category" });
            }
        }

        /// <summary>
        /// Update criteria category (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCriteriaCategoryRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var category = await _categoryService.UpdateCategoryAsync(id, request, User);
                if (category == null)
                {
                    return NotFound(new { message = "Category not found" });
                }

                return Ok(category);
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
                _logger.LogError(ex, "Error updating criteria category {CategoryId}", id);
                return StatusCode(500, new { message = "Error updating criteria category" });
            }
        }

        /// <summary>
        /// Delete criteria category (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var result = await _categoryService.DeleteCategoryAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Category not found" });
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
                _logger.LogError(ex, "Error deleting criteria category {CategoryId}", id);
                return StatusCode(500, new { message = "Error deleting criteria category" });
            }
        }

        /// <summary>
        /// Get category with its criteria
        /// </summary>
        [HttpGet("{id}/with-criteria")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetCategoryWithCriteria(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryWithCriteriaAsync(id, User);
                if (category == null)
                {
                    return NotFound(new { message = "Category not found or not accessible" });
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category {CategoryId} with criteria", id);
                return StatusCode(500, new { message = "Error retrieving category with criteria" });
            }
        }

        /// <summary>
        /// Get only active categories (for public use)
        /// </summary>
        [HttpGet("active")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetActiveCategories()
        {
            try
            {
                var categories = await _categoryService.GetActiveCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active criteria categories");
                return StatusCode(500, new { message = "Error retrieving active criteria categories" });
            }
        }

        /// <summary>
        /// Validate category weights
        /// </summary>
        [HttpGet("validate-weights")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> ValidateWeights()
        {
            try
            {
                var validation = await _categoryService.ValidateWeightsAsync(User);
                return Ok(validation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating category weights");
                return StatusCode(500, new { message = "Error validating category weights" });
            }
        }

        /// <summary>
        /// Rebalance category weights (Admin only)
        /// </summary>
        [HttpPost("rebalance-weights")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> RebalanceWeights([FromBody] List<RebalanceWeightRequest> requests)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _categoryService.RebalanceWeightsAsync(requests, User);
                if (!result)
                {
                    return BadRequest(new { message = "Failed to rebalance weights" });
                }

                return Ok(new { message = "Weights rebalanced successfully" });
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
                _logger.LogError(ex, "Error rebalancing category weights");
                return StatusCode(500, new { message = "Error rebalancing category weights" });
            }
        }
    }
}