using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using PerformanceEvaluation.Application.DTOs.BulkOperations;
using PerformanceEvaluation.Application.Services.Interfaces;

namespace PerformanceEvaluation.API.Controllers
{
    /// <summary>
    /// Controller for bulk operations like import/export and batch updates
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class BulkOperationController : ControllerBase
    {
        private readonly IBulkOperationService _bulkService;
        private readonly ILogger<BulkOperationController> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="bulkService"></param>
        /// <param name="logger"></param>
        public BulkOperationController(IBulkOperationService bulkService, ILogger<BulkOperationController> logger)
        {
            _bulkService = bulkService;
            _logger = logger;
        }

        /// <summary>
        /// Import users from Excel file (Admin only)
        /// </summary>
        /// <param name="file">Excel file containing user data</param>
        /// <returns>Import results with success/failure details</returns>
        [HttpPost("import-users")]
        [Authorize(Policy = "AdminOnly")]
        [RequestSizeLimit(50 * 1024 * 1024)] // 50MB limit
        public async Task<IActionResult> ImportUsers([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "File is required" });
                }

                var result = await _bulkService.ImportUsersAsync(file, User);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing users from file: {FileName}", file?.FileName);
                return StatusCode(500, new { message = "Error importing users" });
            }
        }

        /// <summary>
        /// Import evaluations from Excel file (Admin/Manager only)
        /// </summary>
        /// <param name="file">Excel file containing evaluation data</param>
        /// <returns>Import results with success/failure details</returns>
        [HttpPost("import-evaluations")]
        [Authorize(Policy = "ManagerOrAdmin")]
        [RequestSizeLimit(50 * 1024 * 1024)] // 50MB limit
        public async Task<IActionResult> ImportEvaluations([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "File is required" });
                }

                var result = await _bulkService.ImportEvaluationsAsync(file, User);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing evaluations from file: {FileName}", file?.FileName);
                return StatusCode(500, new { message = "Error importing evaluations" });
            }
        }

        /// <summary>
        /// Bulk update user status (Admin only)
        /// </summary>
        /// <param name="request">Request containing user IDs and new status</param>
        /// <returns>Operation results</returns>
        [HttpPost("update-user-status")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> BulkUpdateUserStatus([FromBody] BulkUpdateStatusRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (!request.UserIds.Any())
                {
                    return BadRequest(new { message = "At least one user ID is required" });
                }

                var result = await _bulkService.BulkUpdateUserStatusAsync(request, User);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user status for {UserCount} users", request.UserIds.Count);
                return StatusCode(500, new { message = "Error updating user status" });
            }
        }

        /// <summary>
        /// Bulk assign evaluators to employees (Admin/Manager only)
        /// </summary>
        /// <param name="request">Request containing evaluator assignments</param>
        /// <returns>Operation results</returns>
        [HttpPost("assign-evaluators")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> BulkAssignEvaluators([FromBody] BulkAssignEvaluatorsRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (!request.Assignments.Any())
                {
                    return BadRequest(new { message = "At least one assignment is required" });
                }

                var result = await _bulkService.BulkAssignEvaluatorsAsync(request, User);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk assigning evaluators for {AssignmentCount} assignments", request.Assignments.Count);
                return StatusCode(500, new { message = "Error assigning evaluators" });
            }
        }

        /// <summary>
        /// Bulk create evaluations (Admin/Manager only)
        /// </summary>
        /// <param name="request">Request containing evaluation details</param>
        /// <returns>Operation results</returns>
        [HttpPost("create-evaluations")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> BulkCreateEvaluations([FromBody] BulkCreateEvaluationsRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (!request.Evaluations.Any())
                {
                    return BadRequest(new { message = "At least one evaluation is required" });
                }

                var result = await _bulkService.BulkCreateEvaluationsAsync(request, User);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk creating {EvaluationCount} evaluations", request.Evaluations.Count);
                return StatusCode(500, new { message = "Error creating evaluations" });
            }
        }

        /// <summary>
        /// Download user import template
        /// </summary>
        /// <returns>Excel template file</returns>
        [HttpGet("user-import-template")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetUserImportTemplate()
        {
            try
            {
                var templateBytes = await _bulkService.GenerateUserImportTemplateAsync();
                return File(templateBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "user_import_template.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating user import template");
                return StatusCode(500, new { message = "Error generating template" });
            }
        }

        /// <summary>
        /// Download evaluation import template
        /// </summary>
        /// <returns>Excel template file</returns>
        [HttpGet("evaluation-import-template")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> GetEvaluationImportTemplate()
        {
            try
            {
                var templateBytes = await _bulkService.GenerateEvaluationImportTemplateAsync();
                return File(templateBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "evaluation_import_template.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating evaluation import template");
                return StatusCode(500, new { message = "Error generating template" });
            }
        }

        /// <summary>
        /// Validate import file format
        /// </summary>
        /// <param name="file">File to validate</param>
        /// <param name="importType">Type of import (users or evaluations)</param>
        /// <returns>Validation results</returns>
        [HttpPost("validate-import")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> ValidateImportFile([FromForm] IFormFile file, [FromForm] string importType)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "File is required" });
                }

                if (string.IsNullOrWhiteSpace(importType))
                {
                    return BadRequest(new { message = "Import type is required" });
                }

                var validationErrors = await _bulkService.ValidateImportFileAsync(file, importType);
                
                return Ok(new 
                { 
                    isValid = !validationErrors.Any(),
                    errors = validationErrors,
                    fileName = file.FileName,
                    fileSize = file.Length,
                    importType = importType
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating import file: {FileName}", file?.FileName);
                return StatusCode(500, new { message = "Error validating file" });
            }
        }

        /// <summary>
        /// Get preview of import file data (first 10 rows)
        /// </summary>
        /// <param name="file">File to preview</param>
        /// <param name="importType">Type of import (users or evaluations)</param>
        /// <returns>Preview data</returns>
        [HttpPost("preview-import")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> GetImportPreview([FromForm] IFormFile file, [FromForm] string importType)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "File is required" });
                }

                if (string.IsNullOrWhiteSpace(importType))
                {
                    return BadRequest(new { message = "Import type is required" });
                }

                var preview = await _bulkService.GetImportPreviewAsync(file, importType);
                return Ok(preview);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting import preview for file: {FileName}", file?.FileName);
                return StatusCode(500, new { message = "Error generating preview" });
            }
        }
    }
}