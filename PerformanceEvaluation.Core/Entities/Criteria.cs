using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Core.Entities
{
    public class Criteria
    {
        public int ID { get; set; } //Primary Key
        public int CategoryID { get; set; } //Foreign key

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? BaseDescription { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;


        //Navigation Properties
        public virtual CriteriaCategory CriteriaCategory { get; set; } = null!;
        public virtual ICollection<RoleCriteriaDescription> RoleCriteriaDescriptions { get; set; } = new List<RoleCriteriaDescription>();
        public virtual ICollection<EvaluationScore> EvaluationScores { get; set; } = new List<EvaluationScore>();
    }
}