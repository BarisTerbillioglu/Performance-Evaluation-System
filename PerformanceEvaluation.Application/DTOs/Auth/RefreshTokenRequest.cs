using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Auth
{
    public class RefreshtokenRequest
    {
        [Required(ErrorMessage = "Refresh token is required")]
        public required string RefreshToken { get; set; }
    }
}