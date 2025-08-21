namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class GlobalSearchResultDto
    {
        public string Query { get; set; } = string.Empty;
        public Dictionary<string, List<SearchResultItemDto>> Results { get; set; } = new();
        public int TotalResults { get; set; }
        public double SearchDuration { get; set; }
        public DateTime Timestamp { get; set; }
        public List<string> Suggestions { get; set; } = new();
    }
}