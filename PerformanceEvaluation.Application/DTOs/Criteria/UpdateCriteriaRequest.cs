using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Criteria
{
    public class UpdateCriteriaRequest
    {
        public int? CategoryId { get; set; }

        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(500)]
        public string? BaseDescription { get; set; }

        public bool? IsActive { get; set; }
    }
}