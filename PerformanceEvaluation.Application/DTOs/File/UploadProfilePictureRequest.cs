using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace PerformanceEvaluation.Application.DTOs.File
{
    public class UploadProfilePictureRequest
    {
        [Required]
        public IFormFile File { get; set; } = null!;
    }
}