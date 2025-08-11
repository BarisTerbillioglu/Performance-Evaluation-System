using PerformanceEvaluation.Core.Entities;

namespace PerformanceEvaluation.Application.Auth
{

    public class UserInfo
    {
        public int ID { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required int DepartmentID { get; set; }
        public  ICollection<RoleAssignment> RoleAssignments { get; set; } = new List<RoleAssignment>();

    }

}