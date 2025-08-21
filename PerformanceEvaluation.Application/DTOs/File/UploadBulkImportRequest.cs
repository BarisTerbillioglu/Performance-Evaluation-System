using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace PerformanceEvaluation.Application.DTOs.File
{
    public class UploadBulkImportRequest
    {
        [Required]
        public IFormFile File { get; set; } = null!;
        
        [Required]
        [StringLength(50)]
        public string ImportType { get; set; } = string.Empty;
    }
}