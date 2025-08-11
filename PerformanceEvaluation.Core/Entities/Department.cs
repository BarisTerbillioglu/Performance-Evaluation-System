using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Core.Entities
{
    public class Department
    {
        public int ID { get; set; } //Primary Key
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}