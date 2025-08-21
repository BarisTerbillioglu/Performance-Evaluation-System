using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class CriteriaSearchRequest : BaseSearchRequest
    {
        public string? Query { get; set; }
        public List<int> CategoryIds { get; set; } = new();
        public bool? IsActive { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "name";
        public string SortDirection { get; set; } = "asc";
    }
}