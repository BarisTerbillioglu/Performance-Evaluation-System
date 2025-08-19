using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Core.Entities
{
    public class RoleAssignment
    {

        [Required]
        public int ID { get; set; } //Primary Key

        public int UserID { get; set; } //Foreign Key
        public int RoleID { get; set; } //Foreign Key
        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;


        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual Role Role { get; set; } = null!;
        
    }
}