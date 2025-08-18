namespace PerformanceEvaluation.Application.DTOs.CriteriaCategory
{
    public class CriteriaCategoryWithCriteriaDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Weight { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int CriteriaCount { get; set; }
        public List<CriteriaSummaryDto> Criteria { get; set; } = new();
    }
}