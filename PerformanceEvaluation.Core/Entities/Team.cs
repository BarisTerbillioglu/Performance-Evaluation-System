using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Core.Entities
{

    public class Team
    {
        public int ID { get; set; } //Primary key

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        //Navigation Properties
        public virtual ICollection<EvaluatorAssignment> EvaluatorAssignments { get; set; } = new List<EvaluatorAssignment>();
    }
}