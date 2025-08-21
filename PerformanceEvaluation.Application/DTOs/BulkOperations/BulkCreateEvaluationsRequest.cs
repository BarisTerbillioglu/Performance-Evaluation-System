using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.BulkOperations
{
    public class BulkCreateEvaluationsRequest
    {
        [Required]
        public List<EvaluationCreationDto> Evaluations { get; set; } = new();
    }

}