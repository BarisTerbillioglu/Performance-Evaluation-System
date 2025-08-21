using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.BulkOperations
{
    public class EvaluationImportDto
    {
        [Required]
        [EmailAddress]
        public string EmployeeEmail { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string EvaluatorEmail { get; set; } = string.Empty;
        
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