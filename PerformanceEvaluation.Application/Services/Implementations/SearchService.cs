using Microsoft.EntityFrameworkCore;
using PerformanceEvaluation.Application.DTOs.Search;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Infrastructure.Data;
using System.Security.Claims;
using System.Diagnostics;
using Microsoft.Extensions.Logging;

namespace PerformanceEvaluation.Application.Services.Implementations
{
    /// <summary>
    /// Complete implementation of search service for all entities
    /// </summary>
    public class SearchService : ISearchService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SearchService> _logger;

        public SearchService(ApplicationDbContext context, ILogger<SearchService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<SearchResultDto<UserSearchDto>> SearchUsersAsync(UserSearchRequest request, ClaimsPrincipal user)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                var query = _context.Users
                    .Include(u => u.Department)
                    .Include(u => u.RoleAssignments)
                        .ThenInclude(ra => ra.Role)
                    .AsQueryable();

                // Apply authorization filter
                var userRole = user.FindFirst("Role")?.Value;
                if (userRole != "Admin")
                {
                    if (userRole == "Manager")
                    {
                        var departmentId = int.Parse(user.FindFirst("DepartmentId")?.Value ?? "0");
                        query = query.Where(u => u.DepartmentID == departmentId);
                    }
                    else
                    {
                        var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                        query = query.Where(u => u.ID == userId);
                    }
                }

                // Apply search filters
                if (!string.IsNullOrEmpty(request.Query))
                {
                    var searchTerm = request.Query.ToLower();
                    query = query.Where(u => 
                        u.FirstName.ToLower().Contains(searchTerm) ||
                        u.LastName.ToLower().Contains(searchTerm) ||
                        u.Email.ToLower().Contains(searchTerm));
                }

                if (!string.IsNullOrEmpty(request.FirstName))
                    query = query.Where(u => u.FirstName.ToLower().Contains(request.FirstName.ToLower()));

                if (!string.IsNullOrEmpty(request.LastName))
                    query = query.Where(u => u.LastName.ToLower().Contains(request.LastName.ToLower()));

                if (!string.IsNullOrEmpty(request.Email))
                    query = query.Where(u => u.Email.ToLower().Contains(request.Email.ToLower()));

                if (request.DepartmentIds.Any())
                    query = query.Where(u => request.DepartmentIds.Contains(u.DepartmentID));

                if (request.SystemRoles.Any())
                    query = query.Where(u => u.RoleAssignments.Any(ra => request.SystemRoles.Contains(ra.Role.Name)));

                if (request.IsActive.HasValue)
                    query = query.Where(u => u.IsActive == request.IsActive.Value);

                if (request.CreatedAfter.HasValue)
                    query = query.Where(u => u.CreatedDate >= request.CreatedAfter.Value);

                if (request.CreatedBefore.HasValue)
                    query = query.Where(u => u.CreatedDate <= request.CreatedBefore.Value);

                // Apply sorting
                query = ApplyUserSorting(query, request.SortBy, request.SortDirection);

                // Get total count for pagination
                var totalCount = await query.CountAsync();

                // Apply pagination
                var users = await query
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync();

                // Map to DTOs
                var userDtos = users.Select(u => new UserSearchDto
                {
                    Id = u.ID,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    DepartmentName = u.Department?.Name ?? "No Department",
                    Roles = u.RoleAssignments.Select(ra => ra.Role.Name).ToList(),
                    IsActive = u.IsActive,
                    CreatedDate = u.CreatedDate,
                    LastLoginDate = u.UpdatedDate
                }).ToList();

                stopwatch.Stop();

                return new SearchResultDto<UserSearchDto>
                {
                    Items = userDtos,
                    TotalCount = totalCount,
                    PageNumber = request.PageNumber,
                    PageSize = request.PageSize,
                    SearchDuration = stopwatch.Elapsed.TotalMilliseconds,
                    Timestamp = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching users");
                throw;
            }
        }

        public async Task<SearchResultDto<EvaluationSearchDto>> SearchEvaluationsAsync(EvaluationSearchRequest request, ClaimsPrincipal user)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                var query = _context.Evaluations
                    .Include(e => e.Evaluator)
                    .Include(e => e.Employee)
                    .AsQueryable();

                // Apply authorization filter
                var userRole = user.FindFirst("Role")?.Value;
                var currentUserId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                if (userRole != "Admin")
                {
                    if (userRole == "Manager")
                    {
                        var departmentId = int.Parse(user.FindFirst("DepartmentId")?.Value ?? "0");
                        query = query.Where(e => e.Employee.DepartmentID == departmentId || e.EvaluatorID == currentUserId);
                    }
                    else
                    {
                        query = query.Where(e => e.EvaluatorID == currentUserId || e.EmployeeID == currentUserId);
                    }
                }

                // Apply search filters
                if (!string.IsNullOrEmpty(request.Query))
                {
                    var searchTerm = request.Query.ToLower();
                    query = query.Where(e => 
                        e.Evaluator.FirstName.ToLower().Contains(searchTerm) ||
                        e.Evaluator.LastName.ToLower().Contains(searchTerm) ||
                        e.Employee.FirstName.ToLower().Contains(searchTerm) ||
                        e.Employee.LastName.ToLower().Contains(searchTerm));
                }

                if (request.EvaluatorIds.Any())
                    query = query.Where(e => request.EvaluatorIds.Contains(e.EvaluatorID));

                if (request.EmployeeIds.Any())
                    query = query.Where(e => request.EmployeeIds.Contains(e.EmployeeID));

                if (request.Statuses.Any())
                    query = query.Where(e => request.Statuses.Contains(e.Status));

                if (request.StartDateFrom.HasValue)
                    query = query.Where(e => e.StartDate >= request.StartDateFrom.Value);

                if (request.StartDateTo.HasValue)
                    query = query.Where(e => e.StartDate <= request.StartDateTo.Value);

                if (request.EndDateFrom.HasValue)
                    query = query.Where(e => e.EndDate >= request.EndDateFrom.Value);

                if (request.EndDateTo.HasValue)
                    query = query.Where(e => e.EndDate <= request.EndDateTo.Value);

                if (request.MinScore.HasValue)
                    query = query.Where(e => e.TotalScore >= request.MinScore.Value);

                if (request.MaxScore.HasValue)
                    query = query.Where(e => e.TotalScore <= request.MaxScore.Value);

                // Apply sorting
                query = ApplyEvaluationSorting(query, request.SortBy, request.SortDirection);

                // Get total count for pagination
                var totalCount = await query.CountAsync();

                // Apply pagination
                var evaluations = await query
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync();

                // Map to DTOs
                var evaluationDtos = evaluations.Select(e => new EvaluationSearchDto
                {
                    Id = e.ID,
                    EvaluatorName = $"{e.Evaluator.FirstName} {e.Evaluator.LastName}",
                    EmployeeName = $"{e.Employee.FirstName} {e.Employee.LastName}",
                    Status = e.Status,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    TotalScore = e.TotalScore,
                    CreatedDate = e.CreatedDate,
                    CompletedDate = e.CompletedDate,
                    Period = e.Period
                }).ToList();

                stopwatch.Stop();

                return new SearchResultDto<EvaluationSearchDto>
                {
                    Items = evaluationDtos,
                    TotalCount = totalCount,
                    PageNumber = request.PageNumber,
                    PageSize = request.PageSize,
                    SearchDuration = stopwatch.Elapsed.TotalMilliseconds,
                    Timestamp = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching evaluations");
                throw;
            }
        }

        public async Task<SearchResultDto<CriteriaSearchDto>> SearchCriteriaAsync(CriteriaSearchRequest request, ClaimsPrincipal user)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                var query = _context.Criteria
                    .Include(c => c.CriteriaCategory)
                    .AsQueryable();

                // Apply search filters
                if (!string.IsNullOrEmpty(request.Query))
                {
                    var searchTerm = request.Query.ToLower();
                    query = query.Where(c => 
                        c.Name.ToLower().Contains(searchTerm) ||
                        c.BaseDescription.ToLower().Contains(searchTerm) ||
                        c.CriteriaCategory.Name.ToLower().Contains(searchTerm));
                }

                if (request.CategoryIds.Any())
                    query = query.Where(c => request.CategoryIds.Contains(c.CategoryID));

                if (request.IsActive.HasValue)
                    query = query.Where(c => c.IsActive == request.IsActive.Value);

                // Apply sorting
                query = ApplyCriteriaSorting(query, request.SortBy, request.SortDirection);

                // Get total count for pagination
                var totalCount = await query.CountAsync();

                // Apply pagination
                var criteria = await query
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync();

                // Map to DTOs
                var criteriaDtos = criteria.Select(c => new CriteriaSearchDto
                {
                    Id = c.ID,
                    Name = c.Name,
                    BaseDescription = c.BaseDescription,
                    CategoryName = c.CriteriaCategory.Name,
                    IsActive = c.IsActive,
                    CreatedDate = c.CreatedDate
                }).ToList();

                stopwatch.Stop();

                return new SearchResultDto<CriteriaSearchDto>
                {
                    Items = criteriaDtos,
                    TotalCount = totalCount,
                    PageNumber = request.PageNumber,
                    PageSize = request.PageSize,
                    SearchDuration = stopwatch.Elapsed.TotalMilliseconds,
                    Timestamp = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching criteria");
                throw;
            }
        }

        public async Task<GlobalSearchResultDto> GlobalSearchAsync(GlobalSearchRequest request, ClaimsPrincipal user)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = new GlobalSearchResultDto
            {
                Query = request.Query,
                Timestamp = DateTime.UtcNow
            };

            try
            {
                var entityTypes = request.EntityTypes.Any() ? request.EntityTypes : 
                    new List<string> { "Users", "Evaluations", "Criteria", "Departments" };

                var totalResults = 0;

                // Search Users
                if (entityTypes.Contains("Users") || entityTypes.Contains("users"))
                {
                    await SearchUsersForGlobal(request, user, result);
                }

                // Search Evaluations
                if (entityTypes.Contains("Evaluations") || entityTypes.Contains("evaluations"))
                {
                    await SearchEvaluationsForGlobal(request, user, result);
                }

                // Search Criteria
                if (entityTypes.Contains("Criteria") || entityTypes.Contains("criteria"))
                {
                    await SearchCriteriaForGlobal(request, user, result);
                }

                // Search Departments
                if (entityTypes.Contains("Departments") || entityTypes.Contains("departments"))
                {
                    await SearchDepartmentsForGlobal(request, user, result);
                }

                // Calculate total results
                result.TotalResults = result.Results.Values.Sum(items => items.Count);

                // Generate suggestions if enabled
                if (request.Query.Length >= 2)
                {
                    result.Suggestions = await GenerateSearchSuggestions(request.Query);
                }

                stopwatch.Stop();
                result.SearchDuration = stopwatch.Elapsed.TotalMilliseconds;

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing global search");
                throw;
            }
        }

        public async Task<List<SearchSuggestionDto>> GetSearchSuggestionsAsync(string query, string entityType, ClaimsPrincipal user)
        {
            try
            {
                var suggestions = new List<SearchSuggestionDto>();

                if (string.IsNullOrEmpty(query) || query.Length < 2)
                    return suggestions;

                var queryLower = query.ToLower();

                // Generate suggestions based on entity type
                switch (entityType.ToLower())
                {
                    case "users":
                        suggestions.AddRange(await GetUserSuggestions(queryLower, user));
                        break;
                    case "evaluations":
                        suggestions.AddRange(await GetEvaluationSuggestions(queryLower, user));
                        break;
                    case "criteria":
                        suggestions.AddRange(await GetCriteriaSuggestions(queryLower, user));
                        break;
                    case "all":
                    default:
                        suggestions.AddRange(await GetUserSuggestions(queryLower, user));
                        suggestions.AddRange(await GetEvaluationSuggestions(queryLower, user));
                        suggestions.AddRange(await GetCriteriaSuggestions(queryLower, user));
                        break;
                }

                // Add common search patterns
                suggestions.AddRange(GetCommonSearchPatterns(query));

                return suggestions.Take(10).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting search suggestions");
                return new List<SearchSuggestionDto>();
            }
        }

        public async Task<AdvancedAnalyticsDto> GetAdvancedAnalyticsAsync(AnalyticsRequest request, ClaimsPrincipal user)
        {
            try
            {
                var userRole = user.FindFirst("Role")?.Value;
                if (userRole != "Admin" && userRole != "Manager")
                {
                    throw new UnauthorizedAccessException("Only administrators and managers can access advanced analytics");
                }

                var result = new AdvancedAnalyticsDto
                {
                    GeneratedAt = DateTime.UtcNow,
                    Period = $"{request.StartDate:yyyy-MM-dd} to {request.EndDate:yyyy-MM-dd}"
                };

                // Get evaluation metrics
                var evaluationQuery = _context.Evaluations.AsQueryable();

                if (request.StartDate.HasValue)
                    evaluationQuery = evaluationQuery.Where(e => e.CreatedDate >= request.StartDate.Value);

                if (request.EndDate.HasValue)
                    evaluationQuery = evaluationQuery.Where(e => e.CreatedDate <= request.EndDate.Value);

                if (request.DepartmentIds.Any())
                {
                    evaluationQuery = evaluationQuery
                        .Include(e => e.Employee)
                        .Where(e => request.DepartmentIds.Contains(e.Employee.DepartmentID));
                }

                // Basic metrics
                var totalEvaluations = await evaluationQuery.CountAsync();
                var completedEvaluations = await evaluationQuery.CountAsync(e => e.Status == "Completed");
                var averageScore = await evaluationQuery
                    .Where(e => e.Status == "Completed" && e.TotalScore > 0)
                    .AverageAsync(e => e.TotalScore);

                result.Metrics = new Dictionary<string, object>
                {
                    ["TotalEvaluations"] = totalEvaluations,
                    ["CompletedEvaluations"] = completedEvaluations,
                    ["CompletionRate"] = totalEvaluations > 0 ? (decimal)completedEvaluations / totalEvaluations * 100 : 0,
                    ["AverageScore"] = Math.Round(averageScore, 2)
                };

                // Generate chart data based on groupBy parameter
                if (request.GroupBy == "month")
                {
                    result.ChartData = await GetMonthlyChartData(evaluationQuery);
                }
                else if (request.GroupBy == "department")
                {
                    result.ChartData = await GetDepartmentChartData(evaluationQuery);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting advanced analytics");
                throw;
            }
        }

        // Helper methods for sorting
        private IQueryable<Core.Entities.User> ApplyUserSorting(IQueryable<Core.Entities.User> query, string sortBy, string sortDirection)
        {
            var ascending = sortDirection?.ToLower() == "asc";

            return sortBy?.ToLower() switch
            {
                "firstname" => ascending ? query.OrderBy(u => u.FirstName) : query.OrderByDescending(u => u.FirstName),
                "lastname" => ascending ? query.OrderBy(u => u.LastName) : query.OrderByDescending(u => u.LastName),
                "email" => ascending ? query.OrderBy(u => u.Email) : query.OrderByDescending(u => u.Email),
                "department" => ascending ? query.OrderBy(u => u.Department.Name) : query.OrderByDescending(u => u.Department.Name),
                "createddate" => ascending ? query.OrderBy(u => u.CreatedDate) : query.OrderByDescending(u => u.CreatedDate),
                _ => query.OrderBy(u => u.LastName).ThenBy(u => u.FirstName)
            };
        }

        private IQueryable<Core.Entities.Evaluation> ApplyEvaluationSorting(IQueryable<Core.Entities.Evaluation> query, string sortBy, string sortDirection)
        {
            var ascending = sortDirection?.ToLower() == "asc";

            return sortBy?.ToLower() switch
            {
                "evaluator" => ascending ? query.OrderBy(e => e.Evaluator.LastName) : query.OrderByDescending(e => e.Evaluator.LastName),
                "employee" => ascending ? query.OrderBy(e => e.Employee.LastName) : query.OrderByDescending(e => e.Employee.LastName),
                "status" => ascending ? query.OrderBy(e => e.Status) : query.OrderByDescending(e => e.Status),
                "startdate" => ascending ? query.OrderBy(e => e.StartDate) : query.OrderByDescending(e => e.StartDate),
                "enddate" => ascending ? query.OrderBy(e => e.EndDate) : query.OrderByDescending(e => e.EndDate),
                "totalscore" => ascending ? query.OrderBy(e => e.TotalScore) : query.OrderByDescending(e => e.TotalScore),
                "completeddate" => ascending ? query.OrderBy(e => e.CompletedDate) : query.OrderByDescending(e => e.CompletedDate),
                _ => query.OrderByDescending(e => e.CreatedDate)
            };
        }

        private IQueryable<Core.Entities.Criteria> ApplyCriteriaSorting(IQueryable<Core.Entities.Criteria> query, string sortBy, string sortDirection)
        {
            var ascending = sortDirection?.ToLower() == "asc";

            return sortBy?.ToLower() switch
            {
                "name" => ascending ? query.OrderBy(c => c.Name) : query.OrderByDescending(c => c.Name),
                "category" => ascending ? query.OrderBy(c => c.CriteriaCategory.Name) : query.OrderByDescending(c => c.CriteriaCategory.Name),
                "createddate" => ascending ? query.OrderBy(c => c.CreatedDate) : query.OrderByDescending(c => c.CreatedDate),
                _ => query.OrderBy(c => c.Name)
            };
        }

        // Helper methods for global search
        private async Task SearchUsersForGlobal(GlobalSearchRequest request, ClaimsPrincipal user, GlobalSearchResultDto result)
        {
            var userQuery = _context.Users.Include(u => u.Department).AsQueryable();

            // Apply authorization
            var userRole = user.FindFirst("Role")?.Value;
            if (userRole != "Admin")
            {
                if (userRole == "Manager")
                {
                    var departmentId = int.Parse(user.FindFirst("DepartmentId")?.Value ?? "0");
                    userQuery = userQuery.Where(u => u.DepartmentID == departmentId);
                }
                else
                {
                    var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                    userQuery = userQuery.Where(u => u.ID == userId);
                }
            }

            if (!string.IsNullOrEmpty(request.Query))
            {
                var searchTerm = request.Query.ToLower();
                userQuery = userQuery.Where(u => 
                    u.FirstName.ToLower().Contains(searchTerm) ||
                    u.LastName.ToLower().Contains(searchTerm) ||
                    u.Email.ToLower().Contains(searchTerm));
            }

            var users = await userQuery.Take(request.PageSize).ToListAsync();

            var userItems = users.Select(u => new SearchResultItemDto
            {
                Id = u.ID.ToString(),
                Title = $"{u.FirstName} {u.LastName}",
                Description = $"{u.Email} - {u.Department?.Name ?? "No Department"}",
                Url = $"/users/{u.ID}",
                EntityType = "User",
                Metadata = new Dictionary<string, object>
                {
                    ["Department"] = u.Department?.Name ?? "No Department",
                    ["IsActive"] = u.IsActive,
                    ["Email"] = u.Email
                },
                RelevanceScore = CalculateRelevanceScore(request.Query, $"{u.FirstName} {u.LastName} {u.Email}")
            }).ToList();

            if (request.IncludeHighlight)
            {
                foreach (var item in userItems)
                {
                    item.Highlights = GenerateHighlights(request.Query, item.Title + " " + item.Description);
                }
            }

            result.Results["Users"] = userItems;
        }

        private async Task SearchEvaluationsForGlobal(GlobalSearchRequest request, ClaimsPrincipal user, GlobalSearchResultDto result)
        {
            var evaluationQuery = _context.Evaluations
                .Include(e => e.Evaluator)
                .Include(e => e.Employee)
                .AsQueryable();

            // Apply authorization
            var userRole = user.FindFirst("Role")?.Value;
            var currentUserId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            if (userRole != "Admin")
            {
                if (userRole == "Manager")
                {
                    var departmentId = int.Parse(user.FindFirst("DepartmentId")?.Value ?? "0");
                    evaluationQuery = evaluationQuery.Where(e => e.Employee.DepartmentID == departmentId || e.EvaluatorID == currentUserId);
                }
                else
                {
                    evaluationQuery = evaluationQuery.Where(e => e.EvaluatorID == currentUserId || e.EmployeeID == currentUserId);
                }
            }

            if (!string.IsNullOrEmpty(request.Query))
            {
                var searchTerm = request.Query.ToLower();
                evaluationQuery = evaluationQuery.Where(e => 
                    e.Evaluator.FirstName.ToLower().Contains(searchTerm) ||
                    e.Evaluator.LastName.ToLower().Contains(searchTerm) ||
                    e.Employee.FirstName.ToLower().Contains(searchTerm) ||
                    e.Employee.LastName.ToLower().Contains(searchTerm) ||
                    e.Status.ToLower().Contains(searchTerm));
            }

            var evaluations = await evaluationQuery.Take(request.PageSize).ToListAsync();

            var evaluationItems = evaluations.Select(e => new SearchResultItemDto
            {
                Id = e.ID.ToString(),
                Title = $"Evaluation: {e.Employee.FirstName} {e.Employee.LastName}",
                Description = $"By {e.Evaluator.FirstName} {e.Evaluator.LastName} - Status: {e.Status}",
                Url = $"/evaluations/{e.ID}",
                EntityType = "Evaluation",
                Metadata = new Dictionary<string, object>
                {
                    ["Status"] = e.Status,
                    ["StartDate"] = e.StartDate.ToString("yyyy-MM-dd"),
                    ["EndDate"] = e.EndDate.ToString("yyyy-MM-dd"),
                    ["TotalScore"] = e.TotalScore
                },
                RelevanceScore = CalculateRelevanceScore(request.Query, 
                    $"{e.Employee.FirstName} {e.Employee.LastName} {e.Evaluator.FirstName} {e.Evaluator.LastName} {e.Status}")
            }).ToList();

            result.Results["Evaluations"] = evaluationItems;
        }

        private async Task SearchCriteriaForGlobal(GlobalSearchRequest request, ClaimsPrincipal user, GlobalSearchResultDto result)
        {
            var criteriaQuery = _context.Criteria
                .Include(c => c.CriteriaCategory)
                .AsQueryable();

            if (!string.IsNullOrEmpty(request.Query))
            {
                var searchTerm = request.Query.ToLower();
                criteriaQuery = criteriaQuery.Where(c => 
                    c.Name.ToLower().Contains(searchTerm) ||
                    c.BaseDescription.ToLower().Contains(searchTerm) ||
                    c.CriteriaCategory.Name.ToLower().Contains(searchTerm));
            }

            var criteria = await criteriaQuery.Take(request.PageSize).ToListAsync();

            var criteriaItems = criteria.Select(c => new SearchResultItemDto
            {
                Id = c.ID.ToString(),
                Title = c.Name,
                Description = $"{c.BaseDescription} - Category: {c.CriteriaCategory.Name}",
                Url = $"/criteria/{c.ID}",
                EntityType = "Criteria",
                Metadata = new Dictionary<string, object>
                {
                    ["Category"] = c.CriteriaCategory.Name,
                    ["IsActive"] = c.IsActive
                },
                RelevanceScore = CalculateRelevanceScore(request.Query, $"{c.Name} {c.BaseDescription}")
            }).ToList();

            result.Results["Criteria"] = criteriaItems;
        }

        private async Task SearchDepartmentsForGlobal(GlobalSearchRequest request, ClaimsPrincipal user, GlobalSearchResultDto result)
        {
            var departmentQuery = _context.Departments.AsQueryable();

            if (!string.IsNullOrEmpty(request.Query))
            {
                var searchTerm = request.Query.ToLower();
                departmentQuery = departmentQuery.Where(d => 
                    d.Name.ToLower().Contains(searchTerm) ||
                    d.Description.ToLower().Contains(searchTerm));
            }

            var departments = await departmentQuery.Take(request.PageSize).ToListAsync();

            var departmentItems = departments.Select(d => new SearchResultItemDto
            {
                Id = d.ID.ToString(),
                Title = d.Name,
                Description = d.Description ?? "No description",
                Url = $"/departments/{d.ID}",
                EntityType = "Department",
                Metadata = new Dictionary<string, object>
                {
                    ["IsActive"] = d.IsActive,
                    ["CreatedDate"] = d.CreatedDate.ToString("yyyy-MM-dd")
                },
                RelevanceScore = CalculateRelevanceScore(request.Query, $"{d.Name} {d.Description}")
            }).ToList();

            result.Results["Departments"] = departmentItems;
        }

        private decimal CalculateRelevanceScore(string query, string text)
        {
            if (string.IsNullOrEmpty(query) || string.IsNullOrEmpty(text))
                return 0;

            var queryLower = query.ToLower();
            var textLower = text.ToLower();

            // Exact match gets highest score
            if (textLower.Contains(queryLower))
            {
                return textLower == queryLower ? 1.0m : 0.8m;
            }

            // Word matches
            var queryWords = queryLower.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var textWords = textLower.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            
            var matchingWords = queryWords.Count(qw => textWords.Any(tw => tw.Contains(qw)));
            return (decimal)matchingWords / queryWords.Length * 0.6m;
        }

        private List<string> GenerateHighlights(string query, string text)
        {
            var highlights = new List<string>();
            if (string.IsNullOrEmpty(query) || string.IsNullOrEmpty(text))
                return highlights;

            var words = query.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            foreach (var word in words)
            {
                var index = text.ToLower().IndexOf(word.ToLower());
                if (index != -1)
                {
                    var start = Math.Max(0, index - 20);
                    var length = Math.Min(text.Length - start, 60);
                    var highlight = text.Substring(start, length);
                    
                    // Add highlighting markers
                    highlight = highlight.Replace(word, $"<mark>{word}</mark>", StringComparison.InvariantCultureIgnoreCase);
                    highlights.Add($"...{highlight}...");
                }
            }

            return highlights.Take(3).ToList();
        }

        private async Task<List<string>> GenerateSearchSuggestions(string query)
        {
            var suggestions = new List<string>();

            if (string.IsNullOrEmpty(query) || query.Length < 2)
                return suggestions;

            // Add common search patterns based on query
            if (query.ToLower().Contains("eval"))
            {
                suggestions.AddRange(new[] { "evaluations completed", "evaluations pending", "evaluation reports" });
            }

            if (query.ToLower().Contains("user") || query.ToLower().Contains("empl"))
            {
                suggestions.AddRange(new[] { "active users", "inactive users", "new employees" });
            }

            if (query.ToLower().Contains("dept") || query.ToLower().Contains("department"))
            {
                suggestions.AddRange(new[] { "department statistics", "department managers", "department reports" });
            }

            return suggestions.Take(5).ToList();
        }

        private async Task<List<SearchSuggestionDto>> GetUserSuggestions(string query, ClaimsPrincipal user)
        {
            var suggestions = new List<SearchSuggestionDto>();

            try
            {
                var userQuery = _context.Users.AsQueryable();

                // Apply authorization
                var userRole = user.FindFirst("Role")?.Value;
                if (userRole != "Admin")
                {
                    if (userRole == "Manager")
                    {
                        var departmentId = int.Parse(user.FindFirst("DepartmentId")?.Value ?? "0");
                        userQuery = userQuery.Where(u => u.DepartmentID == departmentId);
                    }
                    else
                    {
                        var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                        userQuery = userQuery.Where(u => u.ID == userId);
                    }
                }

                var users = await userQuery
                    .Where(u => u.FirstName.ToLower().Contains(query) || 
                               u.LastName.ToLower().Contains(query) ||
                               u.Email.ToLower().Contains(query))
                    .Take(5)
                    .Select(u => new { u.FirstName, u.LastName, u.Email })
                    .ToListAsync();

                foreach (var u in users)
                {
                    suggestions.Add(new SearchSuggestionDto
                    {
                        Text = $"{u.FirstName} {u.LastName}",
                        Type = "User",
                        Category = "People",
                        Count = 1
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user suggestions");
            }

            return suggestions;
        }

        private async Task<List<SearchSuggestionDto>> GetEvaluationSuggestions(string query, ClaimsPrincipal user)
        {
            var suggestions = new List<SearchSuggestionDto>();

            try
            {
                // Add status-based suggestions
                var statuses = new[] { "Draft", "In Progress", "Completed", "Overdue" };
                foreach (var status in statuses)
                {
                    if (status.ToLower().Contains(query))
                    {
                        var count = await _context.Evaluations.CountAsync(e => e.Status == status);
                        suggestions.Add(new SearchSuggestionDto
                        {
                            Text = $"Evaluations with status: {status}",
                            Type = "Evaluation",
                            Category = "Status",
                            Count = count
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting evaluation suggestions");
            }

            return suggestions;
        }

        private async Task<List<SearchSuggestionDto>> GetCriteriaSuggestions(string query, ClaimsPrincipal user)
        {
            var suggestions = new List<SearchSuggestionDto>();

            try
            {
                var categories = await _context.CriteriaCategories
                    .Where(cc => cc.Name.ToLower().Contains(query))
                    .Take(3)
                    .Select(cc => new { cc.Name, CriteriaCount = cc.Criteria.Count })
                    .ToListAsync();

                foreach (var category in categories)
                {
                    suggestions.Add(new SearchSuggestionDto
                    {
                        Text = $"Criteria in {category.Name}",
                        Type = "Criteria",
                        Category = "Category",
                        Count = category.CriteriaCount
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting criteria suggestions");
            }

            return suggestions;
        }

        private List<SearchSuggestionDto> GetCommonSearchPatterns(string query)
        {
            var patterns = new List<SearchSuggestionDto>();

            // Add common search patterns
            var commonQueries = new Dictionary<string, string[]>
            {
                ["performance"] = new[] { "performance evaluations", "performance reports", "performance trends" },
                ["score"] = new[] { "high scores", "low scores", "average scores" },
                ["pending"] = new[] { "pending evaluations", "pending reviews", "pending approvals" },
                ["completed"] = new[] { "completed evaluations", "completed assessments" },
                ["department"] = new[] { "department performance", "department statistics", "department reports" }
            };

            foreach (var pattern in commonQueries)
            {
                if (query.ToLower().Contains(pattern.Key))
                {
                    foreach (var suggestion in pattern.Value)
                    {
                        patterns.Add(new SearchSuggestionDto
                        {
                            Text = suggestion,
                            Type = "Pattern",
                            Category = "Common",
                            Count = 0
                        });
                    }
                }
            }

            return patterns;
        }

        private async Task<List<ChartDataPoint>> GetMonthlyChartData(IQueryable<Core.Entities.Evaluation> evaluationQuery)
        {
            var monthlyData = await evaluationQuery
                .Where(e => e.Status == "Completed" && e.CompletedDate.HasValue)
                .GroupBy(e => new { e.CompletedDate.Value.Year, e.CompletedDate.Value.Month })
                .Select(g => new ChartDataPoint
                {
                    Label = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Value = g.Count(),
                    Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                    Category = "Monthly"
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            return monthlyData;
        }

        private async Task<List<ChartDataPoint>> GetDepartmentChartData(IQueryable<Core.Entities.Evaluation> evaluationQuery)
        {
            var departmentData = await evaluationQuery
                .Include(e => e.Employee.Department)
                .Where(e => e.Status == "Completed")
                .GroupBy(e => e.Employee.Department.Name)
                .Select(g => new ChartDataPoint
                {
                    Label = g.Key,
                    Value = g.Count(),
                    Date = DateTime.UtcNow,
                    Category = "Department"
                })
                .OrderByDescending(x => x.Value)
                .ToListAsync();

            return departmentData;
        }
    }
}