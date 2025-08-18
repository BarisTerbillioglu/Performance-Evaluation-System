using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Criteria
{
    public class UpdateRoleDescriptionRequest
    {
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Example { get; set; }
    }
}