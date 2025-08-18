namespace PerformanceEvaluation.Application.DTOs.Role
{
    public class RoleAssignmentDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public DateTime AssignedDate { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
    }
}