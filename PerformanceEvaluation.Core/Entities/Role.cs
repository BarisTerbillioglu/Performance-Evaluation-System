using System.ComponentModel.DataAnnotations;
using System.Reflection.Metadata;

namespace PerformanceEvaluation.Core.Entities
{
    public class Role
    {
        public int ID { get; set; } //Primary Key

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        //Navigation Properties
        public virtual ICollection<RoleCriteriaDescription> RoleCriteriaDescriptions { get; set; } = new List<RoleCriteriaDescription>();
        public virtual ICollection<RoleAssignment> RoleAssignments { get; set; } = new List<RoleAssignment>();
    }
}