namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class RecommendationDto
    {
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public List<string> Actions { get; set; } = new();
        public Dictionary<string, object> Context { get; set; } = new();
    }
}