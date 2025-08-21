using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.BulkOperations
{
    public class EvaluatorAssignmentDto
    {
        [Required]
        public int EvaluatorId { get; set; }
        
        [Required]
        public int EmployeeId { get; set; }
        
        [Required]
        public int TeamId { get; set; }
        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    }
}