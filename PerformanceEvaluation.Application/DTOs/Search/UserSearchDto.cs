namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class UserSearchDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new();
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
    }
}