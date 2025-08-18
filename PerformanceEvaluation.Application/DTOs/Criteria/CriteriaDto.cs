namespace PerformanceEvaluation.Application.DTOs.Criteria
{
    public class CriteriaDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? BaseDescription { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal CategoryWeight { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<CriteriaRoleDescriptionDto> RoleDescriptions { get; set; } = new();
    }
}