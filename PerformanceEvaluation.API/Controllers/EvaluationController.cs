using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.Evaluation;
using PerformanceEvaluation.Application.DTOs.EvaluationScore;
using PerformanceEvaluation.Application.DTOs.Comment;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class EvaluationController : ControllerBase
    {
        private readonly IEvaluationService _evaluationService;
        private readonly ILogger<EvaluationController> _logger;

        public EvaluationController(
            IEvaluationService evaluationService,
            ILogger<EvaluationController> logger)
        {
            _evaluationService = evaluationService;
            _logger = logger;
        }

        /// <summary>
        /// Get all evaluations (role-based filtering applied)
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetEvaluations()
        {
            try
            {
                var evaluations = await _evaluationService.GetEvaluationListAsync(User);
                return Ok(evaluations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving evaluations");
                return StatusCode(500, new { message = "Error retrieving evaluations" });
            }
        }

        /// <summary>
        /// Get evaluation by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetEvaluation(int id)
        {
            try
            {
                var evaluation = await _evaluationService.GetEvaluationDetailsAsync(id, User);
                if (evaluation == null)
                {
                    return NotFound(new { message = "Evaluation not found or not accessible" });
                }

                return Ok(evaluation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving evaluation {EvaluationId}", id);
                return StatusCode(500, new { message = "Error retrieving evaluation" });
            }
        }

        /// <summary>
        /// Get evaluation form for scoring
        /// </summary>
        [HttpGet("{id}/form")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> GetEvaluationForm(int id)
        {
            try
            {
                var evaluationForm = await _evaluationService.GetEvaluationFormAsync(id, User);
                if (evaluationForm == null)
                {
                    return NotFound(new { message = "Evaluation not found or not accessible" });
                }

                return Ok(evaluationForm);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving evaluation form {EvaluationId}", id);
                return StatusCode(500, new { message = "Error retrieving evaluation form" });
            }
        }

        /// <summary>
        /// Get evaluation summary
        /// </summary>
        [HttpGet("{id}/summary")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetEvaluationSummary(int id)
        {
            try
            {
                var summary = await _evaluationService.GetEvaluationSummaryAsync(id, User);
                if (summary == null)
                {
                    return NotFound(new { message = "Evaluation not found or not accessible" });
                }

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving evaluation summary {EvaluationId}", id);
                return StatusCode(500, new { message = "Error retrieving evaluation summary" });
            }
        }

        /// <summary>
        /// Create new evaluation (Evaluator/Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> CreateEvaluation([FromBody] CreateEvaluationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var evaluation = await _evaluationService.CreateEvaluationAsync(request, User);
                return CreatedAtAction(nameof(GetEvaluation), new { id = evaluation.Id }, evaluation);
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
                _logger.LogError(ex, "Error creating evaluation");
                return StatusCode(500, new { message = "Error creating evaluation" });
            }
        }

        /// <summary>
        /// Update evaluation (Evaluator/Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> UpdateEvaluation(int id, [FromBody] UpdateEvaluationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Ensure the evaluationId matches the request
                if (request.EvaluationId != id)
                {
                    return BadRequest(new { message = "Evaluation ID mismatch" });
                }

                var result = await _evaluationService.UpdateEvaluationAsync(request, User);
                if (!result)
                {
                    return NotFound(new { message = "Evaluation not found or not accessible" });
                }

                return Ok(new { message = "Evaluation updated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating evaluation {EvaluationId}", id);
                return StatusCode(500, new { message = "Error updating evaluation" });
            }
        }

        /// <summary>
        /// Deactivate evaluation (soft delete)
        /// </summary>
        [HttpPatch("{id}/deactivate")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> DeactivateEvaluation(int id)
        {
            try
            {
                var result = await _evaluationService.DeactivateEvaluationAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Evaluation not found or already inactive" });
                }

                return Ok(new { message = "Evaluation deactivated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating evaluation {EvaluationId}", id);
                return StatusCode(500, new { message = "Error deactivating evaluation" });
            }
        }

        /// <summary>
        /// Reactivate evaluation (Admin only)
        /// </summary>
        [HttpPatch("{id}/reactivate")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ReactivateEvaluation(int id)
        {
            try
            {
                var result = await _evaluationService.ReactivateEvaluationAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Evaluation not found or already active" });
                }

                return Ok(new { message = "Evaluation reactivated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating evaluation {EvaluationId}", id);
                return StatusCode(500, new { message = "Error reactivating evaluation" });
            }
        }

        /// <summary>
        /// Cascade deactivate evaluation and all related data
        /// </summary>
        [HttpPatch("{id}/cascade-deactivate")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> CascadeDeactivateEvaluation(int id)
        {
            try
            {
                var result = await _evaluationService.CascadeDeactivateEvaluationAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Evaluation not found or already inactive" });
                }

                return Ok(new { message = "Evaluation and related data deactivated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cascade deactivating evaluation {EvaluationId}", id);
                return StatusCode(500, new { message = "Error cascade deactivating evaluation" });
            }
        }

        /// <summary>
        /// Permanently delete evaluation (Admin only - use with caution)
        /// </summary>
        [HttpDelete("{id}/permanent")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> PermanentlyDeleteEvaluation(int id)
        {
            try
            {
                var result = await _evaluationService.DeleteEvaluationAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Evaluation not found" });
                }

                return Ok(new { message = "Evaluation permanently deleted" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error permanently deleting evaluation {EvaluationId}", id);
                return StatusCode(500, new { message = "Error permanently deleting evaluation" });
            }
        }

        /// <summary>
        /// Submit evaluation for completion (Evaluator/Admin only)
        /// </summary>
        [HttpPost("{id}/submit")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> SubmitEvaluation(int id)
        {
            try
            {
                var result = await _evaluationService.SubmitEvaluationAsync(id, User);
                if (!result)
                {
                    return NotFound(new { message = "Evaluation not found or not accessible" });
                }

                return Ok(new { message = "Evaluation submitted successfully" });
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
                _logger.LogError(ex, "Error submitting evaluation {EvaluationId}", id);
                return StatusCode(500, new { message = "Error submitting evaluation" });
            }
        }

        /// <summary>
        /// Update score for a specific criteria (Evaluator/Admin only)
        /// </summary>
        [HttpPut("{evaluationId}/criteria/{criteriaId}/score")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> UpdateScore(int evaluationId, int criteriaId, [FromBody] UpdateScoreRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Ensure IDs match the request
                if (request.EvaluationId != evaluationId || request.CriteriaId != criteriaId)
                {
                    return BadRequest(new { message = "ID mismatch in request" });
                }

                var score = await _evaluationService.UpdateScoreAsync(request, User);
                return Ok(score);
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
                _logger.LogError(ex, "Error updating score for evaluation {EvaluationId}, criteria {CriteriaId}", evaluationId, criteriaId);
                return StatusCode(500, new { message = "Error updating score" });
            }
        }

        /// <summary>
        /// Add comment to a score (Evaluator/Admin only)
        /// </summary>
        [HttpPost("{evaluationId}/criteria/{criteriaId}/comments")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> AddComment(int evaluationId, int criteriaId, [FromBody] AddCommentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Ensure IDs match the request
                if (request.EvaluationId != evaluationId || request.CriteriaId != criteriaId)
                {
                    return BadRequest(new { message = "ID mismatch in request" });
                }

                var comment = await _evaluationService.AddCommentToScoreAsync(request, User);
                return Ok(comment);
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
                _logger.LogError(ex, "Error adding comment for evaluation {EvaluationId}, criteria {CriteriaId}", evaluationId, criteriaId);
                return StatusCode(500, new { message = "Error adding comment" });
            }
        }

        /// <summary>
        /// Update comment (Evaluator/Admin only)
        /// </summary>
        [HttpPut("comments/{commentId}")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> UpdateComment(int commentId, [FromBody] UpdateCommentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Ensure ID matches the request
                if (request.CommentId != commentId)
                {
                    return BadRequest(new { message = "Comment ID mismatch" });
                }

                var comment = await _evaluationService.UpdateCommentAsync(request, User);
                if (comment == null)
                {
                    return NotFound(new { message = "Comment not found or not accessible" });
                }

                return Ok(comment);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating comment {CommentId}", commentId);
                return StatusCode(500, new { message = "Error updating comment" });
            }
        }

        /// <summary>
        /// Get comments for a specific criteria score
        /// </summary>
        [HttpGet("{evaluationId}/criteria/{criteriaId}/comments")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetCommentsForScore(int evaluationId, int criteriaId)
        {
            try
            {
                var comments = await _evaluationService.GetCommentsForScoreAsync(evaluationId, criteriaId, User);
                return Ok(comments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comments for evaluation {EvaluationId}, criteria {CriteriaId}", evaluationId, criteriaId);
                return StatusCode(500, new { message = "Error retrieving comments" });
            }
        }

        /// <summary>
        /// Get evaluations by status
        /// </summary>
        [HttpGet("status/{status}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetEvaluationsByStatus(EvaluationStatus status)
        {
            try
            {
                var evaluations = await _evaluationService.GetEvaluationsByStatusAsync(status, User);
                return Ok(evaluations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving evaluations by status {Status}", status);
                return StatusCode(500, new { message = "Error retrieving evaluations by status" });
            }
        }

        /// <summary>
        /// Get evaluations by period
        /// </summary>
        [HttpGet("period/{period}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetEvaluationsByPeriod(string period)
        {
            try
            {
                var evaluations = await _evaluationService.GetEvaluationsByPeriodAsync(period, User);
                return Ok(evaluations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving evaluations by period {Period}", period);
                return StatusCode(500, new { message = "Error retrieving evaluations by period" });
            }
        }

        /// <summary>
        /// Get recent evaluations
        /// </summary>
        [HttpGet("recent")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetRecentEvaluations([FromQuery] int limit = 10)
        {
            try
            {
                var evaluations = await _evaluationService.GetRecentEvaluationsAsync(User, limit);
                return Ok(evaluations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent evaluations");
                return StatusCode(500, new { message = "Error retrieving recent evaluations" });
            }
        }

        /// <summary>
        /// Get dashboard data
        /// </summary>
        [HttpGet("dashboard")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetDashboardData()
        {
            try
            {
                var dashboardData = await _evaluationService.GetDashboardDataAsync(User);
                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard data");
                return StatusCode(500, new { message = "Error retrieving dashboard data" });
            }
        }
    }
}