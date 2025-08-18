using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Criteria
{
    public class CreateCriteriaRequest
    {
        [Required]
        public int CategoryId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? BaseDescription { get; set; }
    }
}