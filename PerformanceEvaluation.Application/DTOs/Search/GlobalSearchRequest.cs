namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class GlobalSearchRequest
    {
        public string Query { get; set; } = string.Empty;
        public List<string> EntityTypes { get; set; } = new();
        public bool IncludeHighlight { get; set; } = true;
        public bool IncludeMetadata { get; set; } = false;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "relevance";
        public string SortDirection { get; set; } = "desc";
    }
}