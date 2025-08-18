using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Criteria
{
    public class AddRoleDescriptionRequest
    {
        [Required]
        public int CriteriaId { get; set; }

        [Required]
        public int RoleId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Example { get; set; }
    }
}