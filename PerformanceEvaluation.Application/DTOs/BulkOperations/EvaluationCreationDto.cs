using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.BulkOperations
{
    public class EvaluationCreationDto
    {
        [Required]
        public int EvaluatedID { get; set; }
        
        [Required]
        public int EvaluatorID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Period { get; set; } = string.Empty;
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        [StringLength(1000)]
        public string? OverallComments { get; set; }
    }
}