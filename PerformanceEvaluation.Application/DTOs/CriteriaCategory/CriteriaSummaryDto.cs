namespace PerformanceEvaluation.Application.DTOs.CriteriaCategory
{
    public class CriteriaSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? BaseDescription { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}