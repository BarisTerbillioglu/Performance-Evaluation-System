
using System.ComponentModel.DataAnnotations;


namespace PerformanceEvaluation.Core.Entities
{
    public class CriteriaCategory
    {
        public int ID { get; set; } //Primary Key

        [MaxLength(100)]
        [Required]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        [Range(0.01, 100, ErrorMessage = "Weight must be between 0.01 and 100")]
        public decimal Weight { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }

        //Navigation properties
        public virtual ICollection<Criteria> Criteria { get; set; } = new List<Criteria>();

    }
}