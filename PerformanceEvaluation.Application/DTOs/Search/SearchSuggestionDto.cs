namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class SearchSuggestionDto
    {
       public string Text { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Category { get; set; } = string.Empty;
    }
}