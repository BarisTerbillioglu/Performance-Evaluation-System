using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Team
{
    public class AssignEvaluatorRequest
    {
        [Required]
        public int TeamId { get; set; }

        [Required]
        public int EvaluatorId { get; set; }
    }   
}