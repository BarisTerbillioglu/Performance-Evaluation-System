using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Team
{
    public class UpdateTeamRequest
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool? IsActive { get; set; }
    }
}