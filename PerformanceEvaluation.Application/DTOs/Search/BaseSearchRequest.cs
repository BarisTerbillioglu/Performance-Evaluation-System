using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class BaseSearchRequest
    {
        public string? Query { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SortBy { get; set; }
        public SortDirection SortDirection { get; set; } = SortDirection.Ascending;
        public bool IncludeFacets { get; set; } = true;
        public Dictionary<string, object> CustomFilters { get; set; } = new();
    }
}