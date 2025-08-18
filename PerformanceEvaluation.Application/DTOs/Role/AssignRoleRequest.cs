using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Role
{
    public class AssignRoleRequest
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int RoleId { get; set; }
    }
}