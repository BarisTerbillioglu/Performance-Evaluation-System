using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.CriteriaCategory
{
    public class CreateCriteriaCategoryRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        [Range(0.01, 100, ErrorMessage = "Weight must be between 0.01 and 100")]
        public decimal Weight { get; set; }
    }
}