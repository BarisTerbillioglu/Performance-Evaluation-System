using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Core.Entities
{
    public class User
    {
        public int ID { get; set; } //Primary Key
        public int DepartmentID { get; set; } //Foreign key

        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }

        //Navigation Properties
        public virtual Department Department { get; set; } = null!;
        public virtual ICollection<RoleAssignment> RoleAssignments { get; set; } = new List<RoleAssignment>();
        public virtual ICollection<EvaluatorAssignment> EvaluatorAssignments { get; set; } = new List<EvaluatorAssignment>();
        public virtual ICollection<EvaluatorAssignment> TeamAssignments { get; set; } = new List<EvaluatorAssignment>();
        public virtual ICollection<Evaluation> EvaluatorEvaluations { get; set; } = new List<Evaluation>();
        public virtual ICollection<Evaluation> EmployeeEvaluations { get; set; } = new List<Evaluation>();
        
    }
}