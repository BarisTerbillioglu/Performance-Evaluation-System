using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Core.Entities
{
    public class Evaluation
    {
        public int ID { get; set; } //Primary key
        public int EvaluatorID { get; set; } //Foreign key
        public int EmployeeID { get; set; } //Foreign key

        [Required]
        [MaxLength(100)]
        public string Period { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;

        [MaxLength(20)]
        public string Status { get; set; } = "Draft";

        public decimal TotalScore { get; set; }

        [MaxLength(1000)]
        public string? GeneralComments { get; set; }


        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedDate { get; set; }

        //Navigation properties
        public virtual User Evaluator { get; set; } = null!;
        public virtual User Employee { get; set; } = null!;
        public virtual ICollection<EvaluationScore> EvaluationScores { get; set; } = new List<EvaluationScore>();


    }
}