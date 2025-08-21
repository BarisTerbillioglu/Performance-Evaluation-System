namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class GlobalSearchRequest
    {
        public string Query { get; set; } = string.Empty;
        public List<string> EntityTypes { get; set; } = new(); 
        public int MaxResultsPerType { get; set; } = 10;
        public bool IncludeHighlight { get; set; } = true;
    }
}