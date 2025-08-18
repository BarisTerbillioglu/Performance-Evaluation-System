using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.CriteriaCategory
{
    public class RebalanceWeightRequest
    {
        [Required]
        public int CategoryId { get; set; }

        [Required]
        [Range(0.01, 100, ErrorMessage = "Weight must be between 0.01 and 100")]
        public decimal Weight { get; set; }
    }
}