using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.User
{
    public class UpdateUserRequest
    {
        [MaxLength(50)]
        public string? FirstName { get; set; }

        [MaxLength(50)]
        public string? LastName { get; set; }

        [EmailAddress]
        [MaxLength(100)]
        public string? Email { get; set; }

        public int? DepartmentId { get; set; }

        public bool? IsActive { get; set; }
    }

}