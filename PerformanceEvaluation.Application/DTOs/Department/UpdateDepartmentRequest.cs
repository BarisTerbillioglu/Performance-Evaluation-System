using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.Department
{
    public class UpdateDepartmentRequest
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool? IsActive { get; set; }
    }
}