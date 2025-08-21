using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace PerformanceEvaluation.Application.DTOs.File
{
    public class UploadDocumentRequest
    {
        [Required]
        public IFormFile File { get; set; } = null!;
        
        [Required]
        [StringLength(50)]
        public string DocumentType { get; set; } = string.Empty;
        
        [StringLength(200)]
        public string? Description { get; set; }
    }
}