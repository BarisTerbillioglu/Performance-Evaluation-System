using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Core.Entities
{
    public class RoleCriteriaDescription
    {
        public int ID { get; set; } //Primary key

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Example { get; set; }

        public int CriteriaID { get; set; }
        public int RoleID { get; set; }

        //Navigation Properties
        public virtual Criteria Criteria { get; set; } = null!;
        public virtual Role Role { get; set; } = null!;
    }
    
}