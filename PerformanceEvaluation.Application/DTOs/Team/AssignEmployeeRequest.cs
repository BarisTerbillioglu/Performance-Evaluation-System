using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Team
{
    public class AssignEmployeeRequest
    {
        [Required]
        public int TeamId { get; set; }

        [Required]
        public int EvaluatorId { get; set; }

        [Required]
        public int EmployeeId { get; set; }
    }   
}