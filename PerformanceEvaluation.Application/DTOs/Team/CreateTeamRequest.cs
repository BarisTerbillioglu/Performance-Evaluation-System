using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Team
{
    public class CreateTeamRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}