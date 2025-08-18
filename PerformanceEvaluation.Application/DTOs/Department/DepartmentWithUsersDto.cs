using PerformanceEvaluation.Application.DTOs.User;

namespace PerformanceEvaluation.Application.DTOs.Department
{
    public class DepartmentWithUsersDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<UserSummaryDto> Users { get; set; } = new();
    }
}