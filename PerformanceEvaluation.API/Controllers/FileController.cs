using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using PerformanceEvaluation.Infrastructure.Services.Interfaces;
using System.Security.Claims;

namespace PerformanceEvaluation.API.Controllers
{
    /// <summary>
    /// Controller for file operations including upload, download, and management
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class FileController : ControllerBase
    {
        private readonly IFileService _fileService;
        private readonly ILogger<FileController> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="fileService"></param>
        /// <param name="logger"></param>
        public FileController(IFileService fileService, ILogger<FileController> logger)
        {
            _fileService = fileService;
            _logger = logger;
        }

        /// <summary>
        /// Upload profile picture for current user
        /// </summary>
        /// <param name="file">Image file to upload</param>
        /// <returns>File path of uploaded image</returns>
        [HttpPost("profile-picture")]
        [RequestSizeLimit(5 * 1024 * 1024)] // 5MB limit
        public async Task<IActionResult> UploadProfilePicture([FromForm] IFormFile file)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var filePath = await _fileService.UploadProfilePictureAsync(file, userId);
                
                return Ok(new { 
                    message = "Profile picture uploaded successfully", 
                    filePath = filePath,
                    uploadedAt = DateTime.UtcNow
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading profile picture for user {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { message = "Error uploading file" });
            }
        }

        /// <summary>
        /// Upload document
        /// </summary>
        /// <param name="file">Document file to upload</param>
        /// <param name="documentType">Type of document (e.g., resume, certificate)</param>
        /// <returns>File path of uploaded document</returns>
        [HttpPost("document")]
        [RequestSizeLimit(10 * 1024 * 1024)] // 10MB limit
        public async Task<IActionResult> UploadDocument([FromForm] IFormFile file, [FromForm] string documentType)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(documentType))
                {
                    return BadRequest(new { message = "Document type is required" });
                }

                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var filePath = await _fileService.UploadDocumentAsync(file, documentType, userId);
                
                return Ok(new { 
                    message = "Document uploaded successfully", 
                    filePath = filePath,
                    documentType = documentType,
                    uploadedAt = DateTime.UtcNow
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading document for user {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { message = "Error uploading file" });
            }
        }

        /// <summary>
        /// Upload bulk import file (Admin/Manager only)
        /// </summary>
        /// <param name="file">Excel or CSV file for bulk import</param>
        /// <param name="importType">Type of import (users, evaluations)</param>
        /// <returns>File path of uploaded file</returns>
        [HttpPost("bulk-import")]
        [Authorize(Policy = "ManagerOrAdmin")]
        [RequestSizeLimit(50 * 1024 * 1024)] // 50MB limit
        public async Task<IActionResult> UploadBulkImportFile([FromForm] IFormFile file, [FromForm] string importType)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(importType))
                {
                    return BadRequest(new { message = "Import type is required" });
                }

                var validationErrors = await _fileService.ValidateFileAsync(file, "BulkImport");
                if (validationErrors.Any())
                {
                    return BadRequest(new { message = "File validation failed", errors = validationErrors });
                }

                var fileName = $"{importType}_{DateTime.UtcNow:yyyyMMdd_HHmmss}{Path.GetExtension(file.FileName)}";
                var filePath = await _fileService.UploadFileAsync(file, "bulk-imports", fileName);
                
                return Ok(new { 
                    message = "Bulk import file uploaded successfully", 
                    filePath = filePath,
                    importType = importType,
                    uploadedAt = DateTime.UtcNow
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading bulk import file");
                return StatusCode(500, new { message = "Error uploading file" });
            }
        }

        /// <summary>
        /// Download file by path
        /// </summary>
        /// <param name="filePath">Relative path to the file</param>
        /// <returns>File content</returns>
        [HttpGet("download")]
        public async Task<IActionResult> DownloadFile([FromQuery] string filePath)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(filePath))
                {
                    return BadRequest(new { message = "File path is required" });
                }

                // Security check - ensure user can only access their own files or is admin
                if (!await CanAccessFile(filePath))
                {
                    return Forbid( "Access denied to this file" );
                }

                var (fileContent, contentType, fileName) = await _fileService.DownloadFileAsync(filePath);
                return File(fileContent, contentType, fileName);
            }
            catch (FileNotFoundException)
            {
                return NotFound(new { message = "File not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading file: {FilePath}", filePath);
                return StatusCode(500, new { message = "Error downloading file" });
            }
        }

        /// <summary>
        /// Get file information
        /// </summary>
        /// <param name="filePath">Relative path to the file</param>
        /// <returns>File information</returns>
        [HttpGet("info")]
        public async Task<IActionResult> GetFileInfo([FromQuery] string filePath)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(filePath))
                {
                    return BadRequest(new { message = "File path is required" });
                }

                if (!await CanAccessFile(filePath))
                {
                    return Forbid( "Access denied to this file" );
                }

                var fileInfo = await _fileService.GetFileInfoAsync(filePath);
                if (fileInfo == null)
                {
                    return NotFound(new { message = "File not found" });
                }

                return Ok(fileInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting file info: {FilePath}", filePath);
                return StatusCode(500, new { message = "Error retrieving file information" });
            }
        }

        /// <summary>
        /// Delete file (Admin only or file owner)
        /// </summary>
        /// <param name="filePath">Relative path to the file</param>
        /// <returns>Success/failure result</returns>
        [HttpDelete]
        public async Task<IActionResult> DeleteFile([FromQuery] string filePath)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(filePath))
                {
                    return BadRequest(new { message = "File path is required" });
                }

                // Only admin or file owner can delete
                if (!User.IsInRole("Admin") && !await IsFileOwner(filePath))
                {
                    return Forbid("Access denied - you can only delete your own files" );
                }

                var result = await _fileService.DeleteFileAsync(filePath);
                if (result)
                {
                    return Ok(new { message = "File deleted successfully" });
                }
                return NotFound(new { message = "File not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file: {FilePath}", filePath);
                return StatusCode(500, new { message = "Error deleting file" });
            }
        }

        /// <summary>
        /// Validate file without uploading
        /// </summary>
        /// <param name="file">File to validate</param>
        /// <param name="fileType">Type category for validation</param>
        /// <returns>Validation results</returns>
        [HttpPost("validate")]
        public async Task<IActionResult> ValidateFile([FromForm] IFormFile file, [FromForm] string fileType)
        {
            try
            {
                var validationErrors = await _fileService.ValidateFileAsync(file, fileType);
                
                return Ok(new 
                { 
                    isValid = !validationErrors.Any(),
                    errors = validationErrors,
                    fileName = file.FileName,
                    fileSize = file.Length,
                    contentType = file.ContentType
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating file");
                return StatusCode(500, new { message = "Error validating file" });
            }
        }

        #region Private Helper Methods

        private async Task<bool> CanAccessFile(string filePath)
        {
            // Admin can access all files
            if (User.IsInRole("Admin"))
                return true;

            // Check if user owns the file
            return await IsFileOwner(filePath);
        }

        private async Task<bool> IsFileOwner(string filePath)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return false;

            // Check if file path contains user ID (simple ownership check)
            return filePath.Contains($"user_{userId}_") || 
                   filePath.Contains($"_{userId}_");
        }

        #endregion
    }
}