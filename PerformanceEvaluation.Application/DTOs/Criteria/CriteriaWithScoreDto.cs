namespace PerformanceEvaluation.Application.DTOs.Criteria
{
    public class CriteriaWithScoreDto
    {
        public int CriteriaId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public decimal CategoryWeight { get; set; }
        public string? BaseDescription { get; set; }
        public int? Score { get; set; }
        public List<string> Comments { get; set; } = new();
    }
}