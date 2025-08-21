namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class UserSearchDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public List<string> SystemRoles { get; set; } = new();
        public List<string> JobRoles { get; set; } = new();
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public PerformanceMetricsDto? PerformanceMetrics { get; set; }
    }
}