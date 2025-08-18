namespace PerformanceEvaluation.Application.DTOs.User
{
    public class UserWithDetailsDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public List<RoleAssignmentSummaryDto> Roles { get; set; } = new();
        public List<TeamSummaryDto> EvaluatorTeams { get; set; } = new();
        public List<TeamSummaryDto> EmployeeTeams { get; set; } = new();
    }
}