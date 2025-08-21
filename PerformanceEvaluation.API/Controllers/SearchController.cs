using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.Search;
using PerformanceEvaluation.Application.Services.Interfaces;

namespace PerformanceEvaluation.API.Controllers
{
    /// <summary>
    /// Controller for search operations across different entities
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;
        private readonly ILogger<SearchController> _logger;

        public SearchController(ISearchService searchService, ILogger<SearchController> logger)
        {
            _searchService = searchService;
            _logger = logger;
        }

        /// <summary>
        /// Global search across all entities
        /// </summary>
        /// <param name="request">Global search request parameters</param>
        /// <returns>Search results from multiple entity types</returns>
        [HttpPost("global")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GlobalSearch([FromBody] GlobalSearchRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (string.IsNullOrWhiteSpace(request.Query) || request.Query.Length < 2)
                {
                    return BadRequest(new { message = "Search query must be at least 2 characters long" });
                }

                var result = await _searchService.GlobalSearchAsync(request, User);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing global search for query: {Query}", request.Query);
                return StatusCode(500, new { message = "Error performing search" });
            }
        }

        /// <summary>
        /// Search users with advanced filtering
        /// </summary>
        /// <param name="request">User search request parameters</param>
        /// <returns>Paginated user search results</returns>
        [HttpPost("users")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> SearchUsers([FromBody] UserSearchRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _searchService.SearchUsersAsync(request, User);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching users");
                return StatusCode(500, new { message = "Error searching users" });
            }
        }

        /// <summary>
        /// Search evaluations with advanced filtering
        /// </summary>
        /// <param name="request">Evaluation search request parameters</param>
        /// <returns>Paginated evaluation search results</returns>
        [HttpPost("evaluations")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> SearchEvaluations([FromBody] EvaluationSearchRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _searchService.SearchEvaluationsAsync(request, User);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching evaluations");
                return StatusCode(500, new { message = "Error searching evaluations" });
            }
        }

        /// <summary>
        /// Search criteria with filtering
        /// </summary>
        /// <param name="request">Criteria search request parameters</param>
        /// <returns>Paginated criteria search results</returns>
        [HttpPost("criteria")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> SearchCriteria([FromBody] CriteriaSearchRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _searchService.SearchCriteriaAsync(request, User);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching criteria");
                return StatusCode(500, new { message = "Error searching criteria" });
            }
        }

        /// <summary>
        /// Get search suggestions for auto-completion
        /// </summary>
        /// <param name="query">Partial search query</param>
        /// <param name="entityType">Type of entity to get suggestions for (users, evaluations, criteria, all)</param>
        /// <param name="limit">Maximum number of suggestions to return</param>
        /// <returns>List of search suggestions</returns>
        [HttpGet("suggestions")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetSearchSuggestions(
            [FromQuery] string query,
            [FromQuery] string entityType = "all",
            [FromQuery] int limit = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
                {
                    return BadRequest(new { message = "Query must be at least 2 characters long" });
                }

                if (limit <= 0 || limit > 50)
                {
                    return BadRequest(new { message = "Limit must be between 1 and 50" });
                }

                var suggestions = await _searchService.GetSearchSuggestionsAsync(query, entityType, User);
                
                // Limit the results
                var limitedSuggestions = suggestions.Take(limit).ToList();
                
                return Ok(new { 
                    suggestions = limitedSuggestions,
                    query = query,
                    entityType = entityType,
                    count = limitedSuggestions.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting search suggestions for query: {Query}", query);
                return StatusCode(500, new { message = "Error getting search suggestions" });
            }
        }

        /// <summary>
        /// Get advanced analytics data for search and reporting
        /// </summary>
        /// <param name="request">Analytics request parameters</param>
        /// <returns>Advanced analytics data</returns>
        [HttpPost("analytics")]
        [Authorize(Policy = "ManagerOrAdmin")]
        public async Task<IActionResult> GetAdvancedAnalytics([FromBody] AnalyticsRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _searchService.GetAdvancedAnalyticsAsync(request, User);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting advanced analytics");
                return StatusCode(500, new { message = "Error retrieving analytics data" });
            }
        }

        /// <summary>
        /// Quick search for simple queries (GET endpoint for easy integration)
        /// </summary>
        /// <param name="q">Search query</param>
        /// <param name="type">Entity type filter (optional)</param>
        /// <param name="limit">Maximum results to return</param>
        /// <returns>Quick search results</returns>
        [HttpGet("quick")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> QuickSearch(
            [FromQuery] string q,
            [FromQuery] string? type = null,
            [FromQuery] int limit = 20)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
                {
                    return BadRequest(new { message = "Search query must be at least 2 characters long" });
                }

                if (limit <= 0 || limit > 100)
                {
                    return BadRequest(new { message = "Limit must be between 1 and 100" });
                }

                var request = new GlobalSearchRequest
                {
                    Query = q,
                    EntityTypes = type != null ? new List<string> { type } : new List<string>(),
                    PageSize = limit,
                    PageNumber = 1,
                    IncludeHighlight = true
                };

                var result = await _searchService.GlobalSearchAsync(request, User);
                
                // Flatten results for quick search response
                var quickResults = new List<object>();
                
                foreach (var entityGroup in result.Results)
                {
                    foreach (var item in entityGroup.Value.Take(limit))
                    {
                        quickResults.Add(new
                        {
                            id = item.Id,
                            title = item.Title,
                            description = item.Description,
                            type = item.EntityType,
                            url = item.Url,
                            relevanceScore = item.RelevanceScore,
                            highlights = item.Highlights
                        });
                    }
                    
                    if (quickResults.Count >= limit) break;
                }

                // Sort by relevance across all entity types
                quickResults = quickResults
                    .OrderByDescending(r => ((dynamic)r).relevanceScore)
                    .Take(limit)
                    .ToList();

                return Ok(new
                {
                    query = q,
                    results = quickResults,
                    totalFound = result.TotalResults,
                    searchTime = result.SearchDuration,
                    hasMore = result.TotalResults > limit
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing quick search for query: {Query}", q);
                return StatusCode(500, new { message = "Error performing quick search" });
            }
        }

        /// <summary>
        /// Get search statistics and popular queries (Admin only)
        /// </summary>
        /// <returns>Search usage statistics</returns>
        [HttpGet("statistics")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetSearchStatistics()
        {
            try
            {
                // This would typically come from a search analytics service
                // For now, return basic statistics
                var stats = new
                {
                    TotalSearches = 0, // Would be tracked in analytics service
                    PopularQueries = new List<object>(), // Would come from search logs
                    EntityTypeDistribution = new
                    {
                        Users = 0,
                        Evaluations = 0,
                        Criteria = 0,
                        Departments = 0
                    },
                    AverageResponseTime = 0.0,
                    LastUpdated = DateTime.UtcNow
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting search statistics");
                return StatusCode(500, new { message = "Error retrieving search statistics" });
            }
        }
    }
}