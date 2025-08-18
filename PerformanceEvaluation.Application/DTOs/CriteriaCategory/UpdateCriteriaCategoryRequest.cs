using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.CriteriaCategory
{
    public class UpdateCriteriaCategoryRequest
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [Range(0.01, 100, ErrorMessage = "Weight must be between 0.01 and 100")]
        public decimal? Weight { get; set; }

        public bool? IsActive { get; set; }
    }
}