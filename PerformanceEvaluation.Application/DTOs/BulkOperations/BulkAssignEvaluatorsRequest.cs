using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.BulkOperations
{
    public class BulkAssignEvaluatorsRequest
    {
        [Required]
        public List<EvaluatorAssignmentDto> Assignments { get; set; } = new();
    }
}