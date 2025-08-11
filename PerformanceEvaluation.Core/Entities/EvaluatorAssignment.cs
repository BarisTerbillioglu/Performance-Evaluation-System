using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Core.Entities
{
    public class EvaluatorAssignment
    {
        public int ID { get; set; }

        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public int EvaluatorID { get; set; }
        public int TeamID { get; set; }

        //Navigation Properties
        public virtual User Evaluator { get; set; } = null!;
        public virtual Team Team { get; set; } = null!;
    }
}