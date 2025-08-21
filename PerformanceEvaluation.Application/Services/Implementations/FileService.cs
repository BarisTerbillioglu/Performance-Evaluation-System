using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Application.DTOs.File;
using PerformanceEvaluation.Infrastructure.Services.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Services.Implementations
{
    /// <summary>
    /// Implementation of file service for handling file operations
    /// </summary>
    public class FileService : IFileService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<FileService> _logger;
        private readonly string _uploadsPath;
        private readonly Dictionary<string, (long maxSize, string[] extensions)> _fileTypeSettings;

        public FileService(IConfiguration configuration, ILogger<FileService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), 
                _configuration["Storage:LocalPath"] ?? "./uploads");

            // Ensure uploads directory exists
            EnsureDirectoriesExist();

            _fileTypeSettings = new Dictionary<string, (long, string[])>
            {
                ["ProfilePicture"] = (
                    _configuration.GetValue<long>("FileUpload:ProfilePictures:MaxFileSizeInMB", 5) * 1024 * 1024,
                    _configuration.GetSection("FileUpload:ProfilePictures:AllowedExtensions").Get<string[]>() ?? new[] { ".jpg", ".jpeg", ".png" }
                ),
                ["Document"] = (
                    _configuration.GetValue<long>("FileUpload:Documents:MaxFileSizeInMB", 10) * 1024 * 1024,
                    _configuration.GetSection("FileUpload:Documents:AllowedExtensions").Get<string[]>() ?? new[] { ".pdf", ".doc", ".docx" }
                ),
                ["BulkImport"] = (
                    _configuration.GetValue<long>("FileUpload:BulkImport:MaxFileSizeInMB", 50) * 1024 * 1024,
                    _configuration.GetSection("FileUpload:BulkImport:AllowedExtensions").Get<string[]>() ?? new[] { ".xlsx", ".xls", ".csv" }
                )
            };
        }

        public async Task<string> UploadFileAsync(IFormFile file, string folder, string? customFileName = null)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is required and cannot be empty");

            var folderPath = Path.Combine(_uploadsPath, folder);
            Directory.CreateDirectory(folderPath);

            var fileName = customFileName ?? $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            _logger.LogInformation("File uploaded successfully: {FileName} to {FolderPath}", fileName, folder);
            return Path.Combine(folder, fileName).Replace('\\', '/');
        }

        public async Task<bool> DeleteFileAsync(string filePath)
        {
            try
            {
                var fullPath = Path.Combine(_uploadsPath, filePath);
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    _logger.LogInformation("File deleted successfully: {FilePath}", filePath);
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file: {FilePath}", filePath);
                return false;
            }
        }

        public async Task<(byte[] fileContent, string contentType, string fileName)> DownloadFileAsync(string filePath)
        {
            var fullPath = Path.Combine(_uploadsPath, filePath);
            
            if (!File.Exists(fullPath))
                throw new FileNotFoundException($"File not found: {filePath}");

            var fileContent = await File.ReadAllBytesAsync(fullPath);
            var contentType = GetContentType(Path.GetExtension(filePath));
            var fileName = Path.GetFileName(filePath);

            return (fileContent, contentType, fileName);
        }

        public async Task<string> UploadProfilePictureAsync(IFormFile file, int userId)
        {
            var validationErrors = await ValidateFileAsync(file, "ProfilePicture");
            if (validationErrors.Any())
                throw new ArgumentException($"File validation failed: {string.Join(", ", validationErrors)}");

            var fileName = $"user_{userId}_{DateTime.UtcNow:yyyyMMdd_HHmmss}{Path.GetExtension(file.FileName)}";
            return await UploadFileAsync(file, "profile-pictures", fileName);
        }

        public async Task<string> UploadDocumentAsync(IFormFile file, string documentType, int userId)
        {
            var validationErrors = await ValidateFileAsync(file, "Document");
            if (validationErrors.Any())
                throw new ArgumentException($"File validation failed: {string.Join(", ", validationErrors)}");

            var fileName = $"{documentType}_{userId}_{DateTime.UtcNow:yyyyMMdd_HHmmss}{Path.GetExtension(file.FileName)}";
            return await UploadFileAsync(file, "documents", fileName);
        }

        public async Task<List<string>> ValidateFileAsync(IFormFile file, string fileType)
        {
            var errors = new List<string>();

            if (file == null || file.Length == 0)
            {
                errors.Add("File is required and cannot be empty");
                return errors;
            }

            if (!_fileTypeSettings.ContainsKey(fileType))
            {
                errors.Add($"Unknown file type: {fileType}");
                return errors;
            }

            var (maxSize, allowedExtensions) = _fileTypeSettings[fileType];

            // Check file size
            if (file.Length > maxSize)
            {
                errors.Add($"File size exceeds the maximum allowed size of {maxSize / (1024 * 1024)} MB");
            }

            // Check file extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                errors.Add($"File type {extension} is not allowed. Allowed types: {string.Join(", ", allowedExtensions)}");
            }

            // Additional security checks
            if (file.FileName.Contains("..") || file.FileName.Contains("/") || file.FileName.Contains("\\"))
            {
                errors.Add("Invalid file name - path traversal detected");
            }

            // Check for malicious content (basic check)
            if (await ContainsMaliciousContentAsync(file))
            {
                errors.Add("File contains potentially malicious content");
            }

            return errors;
        }

        public async Task<bool> FileExistsAsync(string filePath)
        {
            var fullPath = Path.Combine(_uploadsPath, filePath);
            return File.Exists(fullPath);
        }

        public async Task<FileInfoDto?> GetFileInfoAsync(string filePath)
        {
            var fullPath = Path.Combine(_uploadsPath, filePath);
            
            if (!File.Exists(fullPath))
                return null;

            var fileInfo = new FileInfo(fullPath);
            
            return new FileInfoDto
            {
                FileName = fileInfo.Name,
                FileSize = fileInfo.Length,
                ContentType = GetContentType(fileInfo.Extension),
                CreatedDate = fileInfo.CreationTimeUtc,
                LastModified = fileInfo.LastWriteTimeUtc,
                Extension = fileInfo.Extension
            };
        }

        private void EnsureDirectoriesExist()
        {
            Directory.CreateDirectory(_uploadsPath);
            Directory.CreateDirectory(Path.Combine(_uploadsPath, "profile-pictures"));
            Directory.CreateDirectory(Path.Combine(_uploadsPath, "documents"));
            Directory.CreateDirectory(Path.Combine(_uploadsPath, "bulk-imports"));
            Directory.CreateDirectory(Path.Combine(_uploadsPath, "temp"));
        }

        private string GetContentType(string extension)
        {
            return extension.ToLowerInvariant() switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".xls" => "application/vnd.ms-excel",
                ".csv" => "text/csv",
                ".txt" => "text/plain",
                ".zip" => "application/zip",
                _ => "application/octet-stream"
            };
        }

        private async Task<bool> ContainsMaliciousContentAsync(IFormFile file)
        {
            try
            {
                // Basic check for executable file signatures
                var buffer = new byte[10];
                using var stream = file.OpenReadStream();
                await stream.ReadAsync(buffer, 0, buffer.Length);
                
                // Check for common executable signatures
                var signature = System.Text.Encoding.ASCII.GetString(buffer);
                
                // MZ signature (Windows executable)
                if (buffer[0] == 0x4D && buffer[1] == 0x5A) return true;
                
                // ELF signature (Linux executable)
                if (buffer[0] == 0x7F && buffer[1] == 0x45 && buffer[2] == 0x4C && buffer[3] == 0x46) return true;
                
                // Check for script tags or suspicious content in text files
                if (signature.Contains("<script") || signature.Contains("javascript:"))
                    return true;

                return false;
            }
            catch
            {
                // If we can't check, assume it's safe rather than blocking
                return false;
            }
        }
    }
}