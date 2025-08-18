namespace PerformanceEvaluation.Application.DTOs.Department
{
    public class DepartmentStatsDto
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int InactiveUsers { get; set; }
        public int Evaluators { get; set; }
        public int Employees { get; set; }
    }
}