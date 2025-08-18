namespace PerformanceEvaluation.Application.DTOs.Criteria
{
    public class CriteriaRoleDescriptionDto
    {
        public int Id { get; set; }
        public int CriteriaId { get; set; }
        public int RoleId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? Example { get; set; }
    }
}