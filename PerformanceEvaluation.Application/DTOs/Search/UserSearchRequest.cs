namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class UserSearchRequest : BaseSearchRequest
    {
        public string? Query { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public List<int> DepartmentIds { get; set; } = new();
        public List<string> SystemRoles { get; set; } = new();
        public bool? IsActive { get; set; }
        public DateTime? CreatedAfter { get; set; }
        public DateTime? CreatedBefore { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "lastName";
        public string SortDirection { get; set; } = "asc";
    }

}