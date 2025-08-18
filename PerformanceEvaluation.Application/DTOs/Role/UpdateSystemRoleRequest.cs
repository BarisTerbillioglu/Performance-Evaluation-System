using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Role
{
    public class UpdateSystemRoleRequest
    {
        [MaxLength(500)]
        public string? Description { get; set; }

        public bool? IsActive { get; set; }
    }
}