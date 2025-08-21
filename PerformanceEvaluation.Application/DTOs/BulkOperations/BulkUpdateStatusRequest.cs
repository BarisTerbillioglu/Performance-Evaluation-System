using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs.BulkOperations
{
    public class BulkUpdateStatusRequest
    {
        [Required]
        public List<int> UserIds { get; set; } = new();
        
        [Required]
        public bool IsActive { get; set; }
        
        [StringLength(500)]
        public string? Reason { get; set; }
    }
}