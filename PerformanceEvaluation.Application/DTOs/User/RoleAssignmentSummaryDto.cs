namespace PerformanceEvaluation.Application.DTOs.User
{
    public class RoleAssignmentSummaryDto
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public DateTime AssignedDate { get; set; }
    }
}