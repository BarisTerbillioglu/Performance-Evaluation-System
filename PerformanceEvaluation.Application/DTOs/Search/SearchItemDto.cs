namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class SearchItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public Dictionary<string, object> Metadata { get; set; } = new();
        public List<string> Highlights { get; set; } = new();
        public decimal RelevanceScore { get; set; }
    }
}