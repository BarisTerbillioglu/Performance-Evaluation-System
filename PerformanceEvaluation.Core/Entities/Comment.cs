using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Core.Entities
{
    public class Comment
    {
        public int ID { get; set; } //Primary Key
        public int ScoreID { get; set; } //Foreign Key

        [MaxLength(500)]
        [Required]
        public string Description { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }

        //Navigation Properties
        public virtual EvaluationScore EvaluationScore { get; set; } = null!;
    }
}