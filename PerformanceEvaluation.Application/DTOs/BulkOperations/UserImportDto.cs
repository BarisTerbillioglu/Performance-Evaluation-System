using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.BulkOperations
{
    public class UserImportDto
    {
        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string DepartmentName { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string? JobTitle { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        [StringLength(50)]
        public string? SystemRole { get; set; }
        
        [StringLength(50)]
        public string? JobRole { get; set; }
    }
}