using PerformanceEvaluation.Application.DTOs.Search;
using System.Security.Claims;

namespace PerformanceEvaluation.Application.Services.Interfaces
{
    public interface ISearchService
    {
        Task<SearchResultDto<UserSearchDto>> SearchUsersAsync(UserSearchRequest request, ClaimsPrincipal user);
        Task<SearchResultDto<EvaluationSearchDto>> SearchEvaluationsAsync(EvaluationSearchRequest request, ClaimsPrincipal user);
        Task<SearchResultDto<CriteriaSearchDto>> SearchCriteriaAsync(CriteriaSearchRequest request, ClaimsPrincipal user);
        Task<GlobalSearchResultDto> GlobalSearchAsync(GlobalSearchRequest request, ClaimsPrincipal user);
        Task<List<SearchSuggestionDto>> GetSearchSuggestionsAsync(string query, string entityType, ClaimsPrincipal user);
        Task<AdvancedAnalyticsDto> GetAdvancedAnalyticsAsync(AnalyticsRequest request, ClaimsPrincipal user);
    }
}