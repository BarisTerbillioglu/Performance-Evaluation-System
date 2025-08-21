using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Application.DTOs.Search;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Core.Enums;
using PerformanceEvaluation.Infrastructure.Data;
using System.Diagnostics;
using System.Linq.Dynamic.Core;
using System.Security.Claims;

namespace PerformanceEvaluation.Application.Services.Implementations
{
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
            var query = _context.Users
                .Include(u => u.Department)
                .Include(u => u.RoleAssignments)
                    .ThenInclude(ra => ra.Role)
                .AsQueryable();

            // Apply role-based filtering
            if (!user.IsInRole("Admin"))
            {
                if (user.IsInRole("Manager"))
                {
                    var departmentId = int.Parse(user.FindFirst("DepartmentID")?.Value ?? "0");
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
            query = ApplySorting(query, request.SortBy, request.SortDirection);

            // Get total count for pagination
            var totalCount = await query.CountAsync();

            // Apply pagination
            var users = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            // Map to DTOs
            var userDtos = new List<UserSearchDto>();
            foreach (var u in users)
            {
                var userDto = new UserSearchDto
                {
                    Id = u.ID,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    DepartmentName = u.Department?.Name ?? "N/A",
                    SystemRoles = u.RoleAssignments.Where(ra => ra.RoleID <= 3).Select(ra => ra.Role.Name).ToList(),
                    JobRoles = u.RoleAssignments.Where(ra => ra.RoleID > 3).Select(ra => ra.Role.Name).ToList(),
                    IsActive = u.IsActive,
                    CreatedDate = u.CreatedDate
                };

                if (request.IncludePerformanceMetrics)
                {
                    userDto.PerformanceMetrics = await GetUserPerformanceMetrics(u.ID);
                }

                userDtos.Add(userDto);
            }

            var result = new SearchResultDto<UserSearchDto>
            {
                Items = userDtos,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            // Generate facets if requested
            if (request.IncludeFacets)
            {
                result.Facets = await GenerateUserFacets(query);
            }

            return result;
        }

        public async Task<SearchResultDto<EvaluationSearchDto>> SearchEvaluationsAsync(EvaluationSearchRequest request, ClaimsPrincipal user)
        {
            var query = _context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Include(e => e.Employee.Department)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Comments)
                .AsQueryable();

            // Apply role-based filtering
            if (!user.IsInRole("Admin"))
            {
                var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (user.IsInRole("Manager"))
                {
                    var departmentId = int.Parse(user.FindFirst("DepartmentID")?.Value ?? "0");
                    query = query.Where(e => e.Employee.DepartmentID == departmentId);
                }
                else
                {
                    query = query.Where(e => e.EmployeeID == userId || e.EvaluatorID == userId);
                }
            }

            // Apply search filters
            if (!string.IsNullOrEmpty(request.Query))
            {
                var searchTerm = request.Query.ToLower();
                query = query.Where(e => 
                    e.Employee.FirstName.ToLower().Contains(searchTerm) ||
                    e.Employee.LastName.ToLower().Contains(searchTerm) ||
                    e.Evaluator.FirstName.ToLower().Contains(searchTerm) ||
                    e.Evaluator.LastName.ToLower().Contains(searchTerm) ||
                    e.Period.ToLower().Contains(searchTerm) ||
                    (e.GeneralComments != null && e.GeneralComments.ToLower().Contains(searchTerm)));
            }

            if (request.EmployeeIds.Any())
                query = query.Where(e => request.EmployeeIds.Contains(e.EmployeeID));

            if (request.EvaluatorIds.Any())
                query = query.Where(e => request.EvaluatorIds.Contains(e.EvaluatorID));

            if (request.DepartmentIds.Any())
                query = query.Where(e => request.DepartmentIds.Contains(e.Employee.DepartmentID));

            if (request.Statuses.Any())
                query = query.Where(e => request.Statuses.Select(s => s.ToString()).Contains(e.Status));

            if (request.StartDateFrom.HasValue)
                query = query.Where(e => e.StartDate >= request.StartDateFrom.Value);

            if (request.StartDateTo.HasValue)
                query = query.Where(e => e.StartDate <= request.StartDateTo.Value);

            if (request.EndDateFrom.HasValue)
                query = query.Where(e => e.EndDate >= request.EndDateFrom.Value);

            if (request.EndDateTo.HasValue)
                query = query.Where(e => e.EndDate <= request.EndDateTo.Value);

            if (!string.IsNullOrEmpty(request.Period))
                query = query.Where(e => e.Period.ToLower().Contains(request.Period.ToLower()));

            if (request.MinScore.HasValue)
                query = query.Where(e => e.TotalScore >= request.MinScore.Value);

            if (request.MaxScore.HasValue)
                query = query.Where(e => e.TotalScore <= request.MaxScore.Value);

            if (request.HasComments.HasValue)
            {
                if (request.HasComments.Value)
                    query = query.Where(e => e.EvaluationScores.Any(es => es.Comments.Any()) || !string.IsNullOrEmpty(e.GeneralComments));
                else
                    query = query.Where(e => !e.EvaluationScores.Any(es => es.Comments.Any()) && string.IsNullOrEmpty(e.GeneralComments));
            }

            if (request.CriteriaIds.Any())
                query = query.Where(e => e.EvaluationScores.Any(es => request.CriteriaIds.Contains(es.CriteriaID)));

            // Apply sorting
            query = ApplySorting(query, request.SortBy, request.SortDirection);

            var totalCount = await query.CountAsync();

            var evaluations = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var evaluationDtos = evaluations.Select(e => new EvaluationSearchDto
            {
                Id = e.ID,
                EmployeeName = $"{e.Employee.FirstName} {e.Employee.LastName}",
                EvaluatorName = $"{e.Evaluator.FirstName} {e.Evaluator.LastName}",
                DepartmentName = e.Employee.Department.Name,
                Period = e.Period,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                Status = Enum.TryParse<EvaluationStatus>(e.Status, ignoreCase: true, out var status) ? status : EvaluationStatus.Draft,
                TotalScore = e.TotalScore,
                HasComments = e.EvaluationScores.Any(es => es.Comments.Any()) || !string.IsNullOrEmpty(e.GeneralComments),
                CreatedDate = e.CreatedDate
            }).ToList();

            var result = new SearchResultDto<EvaluationSearchDto>
            {
                Items = evaluationDtos,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            if (request.IncludeFacets)
            {
                result.Facets = await GenerateEvaluationFacets(query);
            }

            return result;
        }

        public async Task<SearchResultDto<CriteriaSearchDto>> SearchCriteriaAsync(CriteriaSearchRequest request, ClaimsPrincipal user)
        {
            var query = _context.Criteria
                .Include(c => c.CriteriaCategory)
                .Include(c => c.RoleCriteriaDescriptions)
                    .ThenInclude(rcd => rcd.Role)
                .AsQueryable();

            // Apply search filters
            if (!string.IsNullOrEmpty(request.Query))
            {
                var searchTerm = request.Query.ToLower();
                query = query.Where(c => 
                    c.Name.ToLower().Contains(searchTerm) ||
                    (c.BaseDescription != null && c.BaseDescription.ToLower().Contains(searchTerm)) ||
                    c.CriteriaCategory.Name.ToLower().Contains(searchTerm));
            }

            if (!string.IsNullOrEmpty(request.Name))
                query = query.Where(c => c.Name.ToLower().Contains(request.Name.ToLower()));

            if (!string.IsNullOrEmpty(request.Description))
                query = query.Where(c => c.BaseDescription != null && c.BaseDescription.ToLower().Contains(request.Description.ToLower()));

            if (request.CategoryIds.Any())
                query = query.Where(c => request.CategoryIds.Contains(c.CategoryID));

            if (request.IsActive.HasValue)
                query = query.Where(c => c.IsActive == request.IsActive.Value);

            // Apply sorting
            query = ApplySorting(query, request.SortBy, request.SortDirection);

            var totalCount = await query.CountAsync();

            var criteria = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var criteriaDtos = criteria.Select(c => new CriteriaSearchDto
            {
                Id = c.ID,
                Name = c.Name,
                BaseDescription = c.BaseDescription ?? "",
                CategoryName = c.CriteriaCategory.Name,
                IsActive = c.IsActive,
                ApplicableRoles = c.RoleCriteriaDescriptions.Select(rcd => rcd.Role.Name).ToList(),
                CreatedDate = c.CreatedDate
            }).ToList();

            var result = new SearchResultDto<CriteriaSearchDto>
            {
                Items = criteriaDtos,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            if (request.IncludeFacets)
            {
                result.Facets = await GenerateCriteriaFacets(query);
            }

            return result;
        }

        public async Task<GlobalSearchResultDto> GlobalSearchAsync(GlobalSearchRequest request, ClaimsPrincipal user)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = new GlobalSearchResultDto
            {
                Query = request.Query,
                Results = new Dictionary<string, List<SearchItemDto>>()
            };

            var searchTasks = new List<Task>();

            // Search Users
            if (!request.EntityTypes.Any() || request.EntityTypes.Contains("Users"))
            {
                searchTasks.Add(SearchUsersGlobalAsync(request, user, result));
            }

            // Search Evaluations
            if (!request.EntityTypes.Any() || request.EntityTypes.Contains("Evaluations"))
            {
                searchTasks.Add(SearchEvaluationsGlobalAsync(request, user, result));
            }

            // Search Criteria
            if (!request.EntityTypes.Any() || request.EntityTypes.Contains("Criteria"))
            {
                searchTasks.Add(SearchCriteriaGlobalAsync(request, user, result));
            }

            // Search Departments
            if (!request.EntityTypes.Any() || request.EntityTypes.Contains("Departments"))
            {
                searchTasks.Add(SearchDepartmentsGlobalAsync(request, user, result));
            }

            await Task.WhenAll(searchTasks);

            result.TotalResults = result.Results.Values.Sum(list => list.Count);
            result.SearchTime = stopwatch.Elapsed;

            // Generate suggestions
            result.Suggestions = await GenerateSearchSuggestions(request.Query);

            return result;
        }

        public async Task<List<SearchSuggestionDto>> GetSearchSuggestionsAsync(string query, string entityType, ClaimsPrincipal user)
        {
            var suggestions = new List<SearchSuggestionDto>();

            if (string.IsNullOrEmpty(query) || query.Length < 2)
                return suggestions;

            var searchTerm = query.ToLower();

            switch (entityType.ToLower())
            {
                case "users":
                    var rawUsers = await _context.Users
                        .Where(u => u.FirstName.ToLower().Contains(searchTerm) || 
                                    u.LastName.ToLower().Contains(searchTerm) ||
                                    u.Email.ToLower().Contains(searchTerm))
                        .Take(10)
                        .Select(u => new
                        {
                            u.ID,
                            u.FirstName,
                            u.LastName,
                            u.Email
                        })
                        .ToListAsync();

                    var userSuggestions = rawUsers.Select(u => new SearchSuggestionDto
                    {
                        Text = $"{u.FirstName} {u.LastName}",
                        Type = "User",
                        Count = 1,
                        Metadata = new Dictionary<string, object> { ["Id"] = u.ID, ["Email"] = u.Email }
                    }).ToList();
                    suggestions.AddRange(userSuggestions);
                    break;

                case "evaluations":
                    var evalSuggestions = await _context.Evaluations
                        .Where(e => e.Period.ToLower().Contains(searchTerm))
                        .GroupBy(e => e.Period)
                        .Take(10)
                        .Select(g => new SearchSuggestionDto
                        {
                            Text = g.Key,
                            Type = "Period",
                            Count = g.Count()
                        })
                        .ToListAsync();
                    suggestions.AddRange(evalSuggestions);
                    break;

                case "criteria":
                    var rawCriteria = await _context.Criteria
                        .Where(c => c.Name.ToLower().Contains(searchTerm))
                        .Take(10)
                        .Select(c => new
                        {
                            c.ID,
                            c.Name,
                            CategoryName = c.CriteriaCategory.Name
                        })
                        .ToListAsync();

                        var criteriaSuggestions = rawCriteria.Select(c => new SearchSuggestionDto
                        {
                        Text = c.Name,
                        Type = "Criteria",
                        Count = 1,
                        Metadata = new Dictionary<string, object> { ["Id"] = c.ID, ["Category"] = c.CategoryName }
                        }).ToList();

                        suggestions.AddRange(criteriaSuggestions);
                        break;
            }

            return suggestions;
        }

        public async Task<AdvancedAnalyticsDto> GetAdvancedAnalyticsAsync(AnalyticsRequest request, ClaimsPrincipal user)
        {
            // This would be a complex implementation for advanced analytics
            // Including trends, comparisons, insights, and recommendations
            var analytics = new AdvancedAnalyticsDto();

            // Basic metrics
            var evaluationsQuery = _context.Evaluations
                .Include(e => e.Employee.Department)
                .Where(e => e.StartDate >= request.StartDate && e.EndDate <= request.EndDate);

            if (request.DepartmentIds.Any())
                evaluationsQuery = evaluationsQuery.Where(e => request.DepartmentIds.Contains(e.Employee.DepartmentID));

            if (request.UserIds.Any())
                evaluationsQuery = evaluationsQuery.Where(e => request.UserIds.Contains(e.EmployeeID));

            var evaluations = await evaluationsQuery.ToListAsync();

            // Calculate basic metrics
            analytics.Metrics["TotalEvaluations"] = evaluations.Count;
            analytics.Metrics["CompletedEvaluations"] = evaluations.Count(e => e.Status == "Completed");
            analytics.Metrics["AverageScore"] = evaluations.Where(e => e.TotalScore > 0).Select(e => e.TotalScore).DefaultIfEmpty(0).Average();
            analytics.Metrics["CompletionRate"] = evaluations.Any() ? (decimal)evaluations.Count(e => e.Status == "Completed") / evaluations.Count * 100 : 0;

            // Generate trends
            analytics.Trends = await GenerateTrendData(evaluations, request.GroupBy);

            // Generate comparisons
            analytics.Comparisons = await GenerateComparisons(evaluations, request);

            // Generate insights
            analytics.Insights = GenerateInsights(analytics.Metrics, analytics.Trends);

            // Generate chart data
            analytics.Charts = await GenerateChartData(evaluations, request.GroupBy);

            // Generate recommendations
            analytics.Recommendations = GenerateRecommendations(analytics.Insights, analytics.Metrics);

            return analytics;
        }

        // Helper methods
        private IQueryable<T> ApplySorting<T>(IQueryable<T> query, string? sortBy, SortDirection sortDirection)
        {
            if (string.IsNullOrEmpty(sortBy))
                return query;

            var direction = sortDirection == SortDirection.Ascending ? "asc" : "desc";
            return query.OrderBy($"{sortBy} {direction}");
        }

        private async Task<PerformanceMetricsDto> GetUserPerformanceMetrics(int userId)
        {
            var evaluations = await _context.Evaluations
                .Where(e => e.EmployeeID == userId)
                .ToListAsync();

            var completed = evaluations.Where(e => e.Status == "Completed").ToList();
            var scores = completed.Where(e => e.TotalScore > 0).Select(e => e.TotalScore).ToList();

            return new PerformanceMetricsDto
            {
                TotalEvaluations = evaluations.Count,
                CompletedEvaluations = completed.Count,
                AverageScore = scores.Any() ? scores.Average() : 0,
                LastEvaluationDate = evaluations.Any() ? evaluations.Max(e => e.EndDate) : null,
                TrendDirection = CalculateTrendDirection(scores)
            };
        }

        private string CalculateTrendDirection(List<decimal> scores)
        {
            if (scores.Count < 2) return "Stable";
            
            var recent = scores.TakeLast(3).Average();
            var previous = scores.SkipLast(3).TakeLast(3).DefaultIfEmpty(recent).Average();
            
            var change = recent - previous;
            return change > 0.2m ? "Improving" : change < -0.2m ? "Declining" : "Stable";
        }

        private async Task<Dictionary<string, int>> GenerateUserFacets(IQueryable<Core.Entities.User> query)
        {
            var facets = new Dictionary<string, int>();

            // Department facets
            var departmentCounts = await query
                .GroupBy(u => u.Department.Name)
                .Select(g => new { Name = g.Key, Count = g.Count() })
                .ToListAsync();

            foreach (var dept in departmentCounts)
            {
                facets[$"Department_{dept.Name}"] = dept.Count;
            }

            // Role facets
            var roleCounts = await query
                .SelectMany(u => u.RoleAssignments)
                .GroupBy(ra => ra.Role.Name)
                .Select(g => new { Name = g.Key, Count = g.Count() })
                .ToListAsync();

            foreach (var role in roleCounts)
            {
                facets[$"Role_{role.Name}"] = role.Count;
            }

            // Status facets
            var activeCounts = await query
                .GroupBy(u => u.IsActive)
                .Select(g => new { IsActive = g.Key, Count = g.Count() })
                .ToListAsync();

            foreach (var status in activeCounts)
            {
                facets[$"Status_{(status.IsActive ? "Active" : "Inactive")}"] = status.Count;
            }

            return facets;
        }

        private async Task<Dictionary<string, int>> GenerateEvaluationFacets(IQueryable<Core.Entities.Evaluation> query)
        {
            var facets = new Dictionary<string, int>();

            // Status facets
            var statusCounts = await query
                .GroupBy(e => e.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            foreach (var status in statusCounts)
            {
                facets[$"Status_{status.Status}"] = status.Count;
            }

            // Department facets
            var departmentCounts = await query
                .GroupBy(e => e.Employee.Department.Name)
                .Select(g => new { Name = g.Key, Count = g.Count() })
                .ToListAsync();

            foreach (var dept in departmentCounts)
            {
                facets[$"Department_{dept.Name}"] = dept.Count;
            }

            // Period facets
            var periodCounts = await query
                .GroupBy(e => e.Period)
                .Select(g => new { Period = g.Key, Count = g.Count() })
                .ToListAsync();

            foreach (var period in periodCounts)
            {
                facets[$"Period_{period.Period}"] = period.Count;
            }

            return facets;
        }

        private async Task<Dictionary<string, int>> GenerateCriteriaFacets(IQueryable<Core.Entities.Criteria> query)
        {
            var facets = new Dictionary<string, int>();

            // Category facets
            var categoryCounts = await query
                .GroupBy(c => c.CriteriaCategory.Name)
                .Select(g => new { Name = g.Key, Count = g.Count() })
                .ToListAsync();

            foreach (var category in categoryCounts)
            {
                facets[$"Category_{category.Name}"] = category.Count;
            }

            // Status facets
            var statusCounts = await query
                .GroupBy(c => c.IsActive)
                .Select(g => new { IsActive = g.Key, Count = g.Count() })
                .ToListAsync();

            foreach (var status in statusCounts)
            {
                facets[$"Status_{(status.IsActive ? "Active" : "Inactive")}"] = status.Count;
            }

            return facets;
        }

        private async Task SearchUsersGlobalAsync(GlobalSearchRequest request, ClaimsPrincipal user, GlobalSearchResultDto result)
        {
            var query = _context.Users
                .Include(u => u.Department)
                .Where(u => u.FirstName.Contains(request.Query) || 
                           u.LastName.Contains(request.Query) ||
                           u.Email.Contains(request.Query));

            // Apply role-based filtering
            if (!user.IsInRole("Admin"))
            {
                if (user.IsInRole("Manager"))
                {
                    var departmentId = int.Parse(user.FindFirst("DepartmentID")?.Value ?? "0");
                    query = query.Where(u => u.DepartmentID == departmentId);
                }
                else
                {
                    var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                    query = query.Where(u => u.ID == userId);
                }
            }

            var users = await query.Take(request.MaxResultsPerType).ToListAsync();
            
            var userItems = users.Select(u => new SearchItemDto
            {
                Id = u.ID.ToString(),
                Title = $"{u.FirstName} {u.LastName}",
                Description = $"{u.Email} - {u.Department?.Name}",
                Url = $"/users/{u.ID}",
                EntityType = "User",
                Metadata = new Dictionary<string, object>
                {
                    ["Department"] = u.Department?.Name ?? "N/A",
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

        private async Task SearchEvaluationsGlobalAsync(GlobalSearchRequest request, ClaimsPrincipal user, GlobalSearchResultDto result)
        {
            var query = _context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Include(e => e.Employee.Department)
                .Where(e => e.Employee.FirstName.Contains(request.Query) ||
                           e.Employee.LastName.Contains(request.Query) ||
                           e.Evaluator.FirstName.Contains(request.Query) ||
                           e.Evaluator.LastName.Contains(request.Query) ||
                           e.Period.Contains(request.Query) ||
                           (e.GeneralComments != null && e.GeneralComments.Contains(request.Query)));

            // Apply role-based filtering
            if (!user.IsInRole("Admin"))
            {
                var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (user.IsInRole("Manager"))
                {
                    var departmentId = int.Parse(user.FindFirst("DepartmentID")?.Value ?? "0");
                    query = query.Where(e => e.Employee.DepartmentID == departmentId);
                }
                else
                {
                    query = query.Where(e => e.EmployeeID == userId || e.EvaluatorID == userId);
                }
            }

            var evaluations = await query.Take(request.MaxResultsPerType).ToListAsync();
            
            var evaluationItems = evaluations.Select(e => new SearchItemDto
            {
                Id = e.ID.ToString(),
                Title = $"Evaluation: {e.Employee.FirstName} {e.Employee.LastName} - {e.Period}",
                Description = $"Evaluator: {e.Evaluator.FirstName} {e.Evaluator.LastName} | Status: {e.Status}",
                Url = $"/evaluations/{e.ID}",
                EntityType = "Evaluation",
                Metadata = new Dictionary<string, object>
                {
                    ["Period"] = e.Period,
                    ["Status"] = e.Status.ToString(),
                    ["Department"] = e.Employee.Department.Name,
                    ["TotalScore"] = e.TotalScore.ToString("F2") ?? "N/A"
                },
                RelevanceScore = CalculateRelevanceScore(request.Query, $"{e.Employee.FirstName} {e.Employee.LastName} {e.Period} {e.GeneralComments}")
            }).ToList();

            if (request.IncludeHighlight)
            {
                foreach (var item in evaluationItems)
                {
                    item.Highlights = GenerateHighlights(request.Query, item.Title + " " + item.Description);
                }
            }

            result.Results["Evaluations"] = evaluationItems;
        }

        private async Task SearchCriteriaGlobalAsync(GlobalSearchRequest request, ClaimsPrincipal user, GlobalSearchResultDto result)
        {
            var criteria = await _context.Criteria
                .Include(c => c.CriteriaCategory)
                .Where(c => c.Name.Contains(request.Query) ||
                           (c.BaseDescription != null && c.BaseDescription.Contains(request.Query)) ||
                           c.CriteriaCategory.Name.Contains(request.Query))
                .Take(request.MaxResultsPerType)
                .ToListAsync();

            var criteriaItems = criteria.Select(c => new SearchItemDto
            {
                Id = c.ID.ToString(),
                Title = c.Name,
                Description = $"Category: {c.CriteriaCategory.Name} | {c.BaseDescription ?? "No description"}",
                Url = $"/criteria/{c.ID}",
                EntityType = "Criteria",
                Metadata = new Dictionary<string, object>
                {
                    ["Category"] = c.CriteriaCategory.Name,
                    ["IsActive"] = c.IsActive
                },
                RelevanceScore = CalculateRelevanceScore(request.Query, $"{c.Name} {c.BaseDescription} {c.CriteriaCategory.Name}")
            }).ToList();

            if (request.IncludeHighlight)
            {
                foreach (var item in criteriaItems)
                {
                    item.Highlights = GenerateHighlights(request.Query, item.Title + " " + item.Description);
                }
            }

            result.Results["Criteria"] = criteriaItems;
        }

        private async Task SearchDepartmentsGlobalAsync(GlobalSearchRequest request, ClaimsPrincipal user, GlobalSearchResultDto result)
        {
            var departments = await _context.Departments
                .Where(d => d.Name.Contains(request.Query) ||
                           (d.Description != null && d.Description.Contains(request.Query)))
                .Take(request.MaxResultsPerType)
                .ToListAsync();

            var departmentItems = departments.Select(d => new SearchItemDto
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

            if (request.IncludeHighlight)
            {
                foreach (var item in departmentItems)
                {
                    item.Highlights = GenerateHighlights(request.Query, item.Title + " " + item.Description);
                }
            }

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
            var queryLower = query.ToLower();
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

            // Common search patterns
            var commonPatterns = new[]
            {
                "evaluations by",
                "users in",
                "criteria for",
                "department",
                "completed evaluations",
                "pending evaluations",
                "high performers",
                "low scores"
            };

            suggestions.AddRange(commonPatterns.Where(p => p.Contains(query.ToLower())));

            return suggestions.Take(5).ToList();
        }

        private async Task<List<TrendDataDto>> GenerateTrendData(List<Core.Entities.Evaluation> evaluations, string groupBy)
        {
            var trends = new List<TrendDataDto>();

            switch (groupBy.ToLower())
            {
                case "month":
                    var monthlyData = evaluations
                        .Where(e => e.TotalScore > 0)
                        .GroupBy(e => new { e.StartDate.Year, e.StartDate.Month })
                        .Select(g => new TrendDataDto
                        {
                            Label = $"{g.Key.Year}-{g.Key.Month:D2}",
                            Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                            Value = g.Average(e => e.TotalScore),
                            Category = "Monthly Average"
                        })
                        .OrderBy(t => t.Date)
                        .ToList();
                    trends.AddRange(monthlyData);
                    break;

                case "department":
                    var departmentData = evaluations
                        .Where(e => e.TotalScore > 0)
                        .GroupBy(e => e.Employee.Department.Name)
                        .Select(g => new TrendDataDto
                        {
                            Label = g.Key,
                            Date = DateTime.Now,
                            Value = g.Average(e => e.TotalScore),
                            Category = "Department Average"
                        })
                        .ToList();
                    trends.AddRange(departmentData);
                    break;
            }

            return trends;
        }

        private async Task<List<ComparisonDto>> GenerateComparisons(List<Core.Entities.Evaluation> evaluations, AnalyticsRequest request)
        {
            var comparisons = new List<ComparisonDto>();

            // Compare current period with previous period
            var midPoint = request.StartDate.AddDays((request.EndDate - request.StartDate).TotalDays / 2);
            var firstHalf = evaluations.Where(e => e.StartDate < midPoint && e.TotalScore > 0).ToList();
            var secondHalf = evaluations.Where(e => e.StartDate >= midPoint && e.TotalScore > 0).ToList();

            if (firstHalf.Any() && secondHalf.Any())
            {
                var firstAvg = firstHalf.Average(e => e.TotalScore);
                var secondAvg = secondHalf.Average(e => e.TotalScore);
                var change = ((secondAvg - firstAvg) / firstAvg) * 100;

                comparisons.Add(new ComparisonDto
                {
                    Name = "Period Comparison",
                    CurrentValue = secondAvg,
                    PreviousValue = firstAvg,
                    PercentageChange = change,
                    TrendDirection = change > 0 ? "Improving" : change < 0 ? "Declining" : "Stable"
                });
            }

            return comparisons;
        }

        private List<InsightDto> GenerateInsights(Dictionary<string, decimal> metrics, List<TrendDataDto> trends)
        {
            var insights = new List<InsightDto>();

            // Completion rate insight
            if (metrics.TryGetValue("CompletionRate", out var completionRate))
            {
                if (completionRate < 70)
                {
                    insights.Add(new InsightDto
                    {
                        Type = "Performance",
                        Title = "Low Completion Rate",
                        Description = $"Evaluation completion rate is {completionRate:F1}%, which is below the recommended 80%.",
                        Impact = "High",
                        Data = new Dictionary<string, object> { ["CompletionRate"] = completionRate }
                    });
                }
            }

            // Score trend insight
            if (trends.Count > 1)
            {
                var recent = trends.TakeLast(3).Average(t => t.Value);
                var previous = trends.SkipLast(3).TakeLast(3).DefaultIfEmpty(trends.First()).Average(t => t.Value);
                
                if (recent < previous - 0.5m)
                {
                    insights.Add(new InsightDto
                    {
                        Type = "Trend",
                        Title = "Declining Performance Trend",
                        Description = "Recent evaluation scores show a declining trend compared to previous periods.",
                        Impact = "Medium",
                        Data = new Dictionary<string, object> { ["Recent"] = recent, ["Previous"] = previous }
                    });
                }
            }

            return insights;
        }

        private async Task<Dictionary<string, List<ChartDataDto>>> GenerateChartData(List<Core.Entities.Evaluation> evaluations, string groupBy)
        {
            var charts = new Dictionary<string, List<ChartDataDto>>();

            // Score distribution chart
            var scoreRanges = new[]
            {
                new { Label = "1-2", Min = 1m, Max = 2m, Color = "#dc3545" },
                new { Label = "2-3", Min = 2m, Max = 3m, Color = "#ffc107" },
                new { Label = "3-4", Min = 3m, Max = 4m, Color = "#17a2b8" },
                new { Label = "4-5", Min = 4m, Max = 5m, Color = "#28a745" }
            };

            var scoreDistribution = scoreRanges.Select(range => new ChartDataDto
            {
                Label = range.Label,
                Value = evaluations.Count(e => e.TotalScore >= range.Min && e.TotalScore < range.Max),
                Color = range.Color
            }).ToList();

            charts["ScoreDistribution"] = scoreDistribution;

            // Department performance chart
            var departmentPerformance = evaluations
                .Where(e => e.TotalScore > 0)
                .GroupBy(e => e.Employee.Department.Name)
                .Select(g => new ChartDataDto
                {
                    Label = g.Key,
                    Value = g.Average(e => e.TotalScore),
                    Color = GenerateColor(g.Key.GetHashCode())
                })
                .ToList();

            charts["DepartmentPerformance"] = departmentPerformance;

            return charts;
        }

        private List<RecommendationDto> GenerateRecommendations(List<InsightDto> insights, Dictionary<string, decimal> metrics)
        {
            var recommendations = new List<RecommendationDto>();

            // Recommendations based on insights
            foreach (var insight in insights)
            {
                switch (insight.Type)
                {
                    case "Performance" when insight.Title.Contains("Low Completion Rate"):
                        recommendations.Add(new RecommendationDto
                        {
                            Type = "Process Improvement",
                            Title = "Improve Evaluation Completion",
                            Description = "Implement reminders and incentives to improve evaluation completion rates.",
                            Priority = "High",
                            Actions = new List<string>
                            {
                                "Send automated reminders to evaluators",
                                "Set up deadline notifications",
                                "Provide training on evaluation process",
                                "Implement completion tracking dashboard"
                            }
                        });
                        break;

                    case "Trend" when insight.Title.Contains("Declining"):
                        recommendations.Add(new RecommendationDto
                        {
                            Type = "Performance Management",
                            Title = "Address Performance Decline",
                            Description = "Investigate and address the declining performance trend through targeted interventions.",
                            Priority = "Medium",
                            Actions = new List<string>
                            {
                                "Conduct performance review meetings",
                                "Identify training needs",
                                "Implement improvement plans",
                                "Monitor progress closely"
                            }
                        });
                        break;
                }
            }

            return recommendations;
        }

        private string GenerateColor(int hashCode)
        {
            var colors = new[] { "#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8", "#6f42c1", "#e83e8c", "#fd7e14" };
            return colors[Math.Abs(hashCode) % colors.Length];
        }
    }
}