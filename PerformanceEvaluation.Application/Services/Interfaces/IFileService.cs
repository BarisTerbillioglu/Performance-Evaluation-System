using Microsoft.AspNetCore.Http;
using PerformanceEvaluation.Application.DTOs.File;

namespace PerformanceEvaluation.Infrastructure.Services.Interfaces
{
    public interface IFileService
    {
        Task<string> UploadFileAsync(IFormFile file, string folder, string? customFileName = null);
        Task<bool> DeleteFileAsync(string filePath);
        Task<(byte[] fileContent, string contentType, string fileName)> DownloadFileAsync(string filePath);
        Task<string> UploadProfilePictureAsync(IFormFile file, int userId);
        Task<string> UploadDocumentAsync(IFormFile file, string documentType, int userId);
        Task<List<string>> ValidateFileAsync(IFormFile file, string fileType);
        Task<bool> FileExistsAsync(string filePath);
        Task<FileInfoDto?> GetFileInfoAsync(string filePath);
    }
    
}