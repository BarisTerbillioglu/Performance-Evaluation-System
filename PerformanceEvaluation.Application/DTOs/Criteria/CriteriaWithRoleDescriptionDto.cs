namespace PerformanceEvaluation.Application.DTOs.Criteria
{
    public class CriteriaWithRoleDescriptionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public decimal CategoryWeight { get; set; }
        public string? BaseDescription { get; set; }
        public string? RoleDescription { get; set; }
        public string? RoleExample { get; set; }
        public bool IsActive { get; set; }
    }
}