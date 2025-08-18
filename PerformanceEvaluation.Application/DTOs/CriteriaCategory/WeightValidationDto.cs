namespace PerformanceEvaluation.Application.DTOs.CriteriaCategory
{
    public class WeightValidationDto
    {
        public decimal TotalWeight { get; set; }
        public bool IsValid { get; set; }
        public decimal RemainingWeight { get; set; }
        public List<CategoryWeightDto> Categories { get; set; } = new();
    }
}