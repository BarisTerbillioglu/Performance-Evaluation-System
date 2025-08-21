namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class GlobalSearchResultDto
    {
        public string Query { get; set; } = string.Empty;
        public int TotalResults { get; set; }
        public Dictionary<string, List<SearchItemDto>> Results { get; set; } = new();
        public List<string> Suggestions { get; set; } = new();
        public TimeSpan SearchTime { get; set; }
    }
}