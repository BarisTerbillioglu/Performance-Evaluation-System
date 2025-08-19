using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Core.Entities
{
    public class EvaluationScore
    {
        public int ID { get; set; } //Primary key

        public int Score { get; set; }
        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public int EvaluationID { get; set; } //Foreign Key
        public int CriteriaID { get; set; } //Foreign Key

        //Navigation properties
        public virtual Evaluation Evaluation { get; set; } = null!;
        public virtual Criteria Criteria { get; set; } = null!;
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}