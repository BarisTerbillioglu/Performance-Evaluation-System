using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Team
{
    public class UpdateUserTeamRequest
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int TeamId { get; set; }

        [Required]
        public int EvaluatorId { get; set; }
    }
}