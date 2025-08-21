namespace PerformanceEvaluation.Application.DTOs.Export
{
    public class ExportUsersRequest
    {
        public int? DepartmentId { get; set; }
        public bool? IsActive { get; set; }
        public List<string> SystemRoles { get; set; } = new();
        public bool IncludeRoleAssignments { get; set; } = true;
        public bool IncludePerformanceMetrics { get; set; } = false;
    }
}