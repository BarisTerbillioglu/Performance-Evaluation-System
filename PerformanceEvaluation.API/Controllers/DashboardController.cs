using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.Services.Interfaces;
using System.Security.Claims;

namespace PerformanceEvaluation.API.Controllers
{
    /// <summary>
    /// 
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class DashboardController : ControllerBase
    {
        private readonly IEvaluationService _evaluationService;
        private readonly IUserService _userService;
        private readonly IDepartmentService _departmentService;
        private readonly ICriteriaCategoryService _categoryService;
        private readonly ILogger<DashboardController> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="evaluationService"></param>
        /// <param name="userService"></param>
        /// <param name="departmentService"></param>
        /// <param name="categoryService"></param>
        /// <param name="logger"></param>
        public DashboardController(
            IEvaluationService evaluationService,
            IUserService userService,
            IDepartmentService departmentService,
            ICriteriaCategoryService categoryService,
            ILogger<DashboardController> logger)
        {
            _evaluationService = evaluationService;
            _userService = userService;
            _departmentService = departmentService;
            _categoryService = categoryService;
            _logger = logger;
        }

        /// <summary>
        /// Get dashboard overview for current user
        /// </summary>
        [HttpGet("overview")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetDashboardOverview()
        {
            try
            {
                var userId = GetUserId();
                var userRoles = User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();

                var dashboardData = new
                {
                    User = new
                    {
                        Id = userId,
                        Roles = userRoles,
                        IsAdmin = User.IsInRole("Admin"),
                        IsEvaluator = User.IsInRole("Evaluator"),
                        IsEmployee = User.IsInRole("Employee")
                    },
                    Evaluations = await _evaluationService.GetDashboardDataAsync(User),
                    QuickActions = GetQuickActionsForUser(userRoles)
                };

                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard overview");
                return StatusCode(500, new { message = "Error retrieving dashboard overview" });
            }
        }

        /// <summary>
        /// Get admin dashboard statistics
        /// </summary>
        [HttpGet("admin-stats")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAdminStats()
        {
            try
            {
                var users = await _userService.GetUserListAsync(User);
                var evaluations = await _evaluationService.GetEvaluationListAsync(User);
                var departments = await _departmentService.GetAllDepartmentsAsync(User);
                var categories = await _categoryService.GetAllCategoriesAsync(User);
                var weightValidation = await _categoryService.ValidateWeightsAsync(User);

                var adminStats = new
                {
                    SystemHealth = new
                    {
                        TotalUsers = users.Count(),
                        ActiveUsers = users.Count(u => u.IsActive),
                        TotalEvaluations = evaluations.Count(),
                        CompletedEvaluations = evaluations.Count(e => e.Status == "Completed"),
                        TotalDepartments = departments.Count(),
                        ActiveDepartments = departments.Count(d => d.IsActive),
                        TotalCategories = categories.Count(),
                        ActiveCategories = categories.Count(c => c.IsActive),
                        WeightsValid = weightValidation.IsValid
                    },
                    UserBreakdown = new
                    {
                        Admins = users.Count(u => u.RoleId.Contains(1)),
                        Evaluators = users.Count(u => u.RoleId.Contains(2)),
                        Employees = users.Count(u => u.RoleId.Contains(3)),
                        BusinessAnalysts = users.Count(u => u.RoleId.Contains(4)),
                        Developers = users.Count(u => u.RoleId.Contains(5)),
                        QASpecialists = users.Count(u => u.RoleId.Contains(6))
                    },
                    EvaluationStats = new
                    {
                        Draft = evaluations.Count(e => e.Status == "Draft"),
                        InProgress = evaluations.Count(e => e.Status == "InProgress"),
                        Completed = evaluations.Count(e => e.Status == "Completed"),
                        Approved = evaluations.Count(e => e.Status == "Approved")
                    },
                    RecentActivity = evaluations
                        .OrderByDescending(e => e.CreatedDate)
                        .Take(10)
                        .Select(e => new
                        {
                            e.Id,
                            e.EmployeeName,
                            e.EvaluatorName,
                            e.Status,
                            e.CreatedDate
                        })
                };

                return Ok(adminStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving admin statistics");
                return StatusCode(500, new { message = "Error retrieving admin statistics" });
            }
        }

        /// <summary>
        /// Get evaluator dashboard data
        /// </summary>
        [HttpGet("evaluator-stats")]
        [Authorize(Policy = "EvaluatorOrAdmin")]
        public async Task<IActionResult> GetEvaluatorStats()
        {
            try
            {
                var evaluations = await _evaluationService.GetEvaluationListAsync(User);
                var teamMembers = await _userService.GetEmployeeListAsync(User);

                var evaluatorStats = new
                {
                    TeamOverview = new
                    {
                        TeamMemberCount = teamMembers.Count(),
                        ActiveTeamMembers = teamMembers.Count(tm => tm.IsActive)
                    },
                    EvaluationProgress = new
                    {
                        TotalEvaluations = evaluations.Count(),
                        PendingEvaluations = evaluations.Count(e => e.Status == "Draft" || e.Status == "InProgress"),
                        CompletedEvaluations = evaluations.Count(e => e.Status == "Completed"),
                        AverageScore = evaluations.Where(e => e.Status == "Completed").DefaultIfEmpty()
                            .Average(e => e?.TotalScore ?? 0)
                    },
                    RecentEvaluations = evaluations
                        .OrderByDescending(e => e.CreatedDate)
                        .Take(5)
                        .Select(e => new
                        {
                            e.Id,
                            e.EmployeeName,
                            e.Status,
                            e.TotalScore,
                            e.CreatedDate
                        }),
                    PendingActions = evaluations
                        .Where(e => e.Status == "Draft" || e.Status == "InProgress")
                        .OrderBy(e => e.CreatedDate)
                        .Take(5)
                        .Select(e => new
                        {
                            e.Id,
                            e.EmployeeName,
                            e.Status,
                            DaysOpen = (DateTime.UtcNow - e.CreatedDate).Days
                        })
                };

                return Ok(evaluatorStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving evaluator statistics");
                return StatusCode(500, new { message = "Error retrieving evaluator statistics" });
            }
        }

        /// <summary>
        /// Get employee dashboard data
        /// </summary>
        [HttpGet("employee-stats")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetEmployeeStats()
        {
            try
            {
                var evaluations = await _evaluationService.GetEvaluationListAsync(User);
                var myDepartment = await _departmentService.GetMyDepartmentAsync(User);

                var employeeStats = new
                {
                    MyPerformance = new
                    {
                        TotalEvaluations = evaluations.Count(),
                        CompletedEvaluations = evaluations.Count(e => e.Status == "Completed"),
                        AverageScore = evaluations.Where(e => e.Status == "Completed").DefaultIfEmpty()
                            .Average(e => e?.TotalScore ?? 0),
                        LatestScore = evaluations.Where(e => e.Status == "Completed")
                            .OrderByDescending(e => e.CompletedDate)
                            .FirstOrDefault()?.TotalScore ?? 0
                    },
                    Department = new
                    {
                        Name = myDepartment?.Name ?? "Unknown",
                        Id = myDepartment?.Id ?? 0
                    },
                    RecentEvaluations = evaluations
                        .OrderByDescending(e => e.CreatedDate)
                        .Take(5)
                        .Select(e => new
                        {
                            e.Id,
                            e.EvaluatorName,
                            e.Status,
                            e.TotalScore,
                            e.CreatedDate,
                            e.CompletedDate
                        }),
                    PerformanceTrend = evaluations
                        .Where(e => e.Status == "Completed")
                        .OrderBy(e => e.CompletedDate)
                        .Select(e => new
                        {
                            Date = e.CompletedDate,
                            Score = e.TotalScore
                        })
                };

                return Ok(employeeStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving employee statistics");
                return StatusCode(500, new { message = "Error retrieving employee statistics" });
            }
        }

        /// <summary>
        /// Get system health check
        /// </summary>
        [HttpGet("health")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetSystemHealth()
        {
            try
            {
                var weightValidation = await _categoryService.ValidateWeightsAsync(User);
                var categories = await _categoryService.GetAllCategoriesAsync(User);
                
                var health = new
                {
                    Status = "Healthy",
                    Timestamp = DateTime.UtcNow,
                    Checks = new
                    {
                        WeightsValid = new
                        {
                            Status = weightValidation.IsValid ? "Pass" : "Fail",
                            Message = weightValidation.IsValid ? 
                                "All category weights sum to 100%" : 
                                $"Category weights sum to {weightValidation.TotalWeight}%, should be 100%"
                        },
                        CategoriesActive = new
                        {
                            Status = categories.Any(c => c.IsActive) ? "Pass" : "Fail",
                            Message = $"{categories.Count(c => c.IsActive)} active categories found"
                        }
                    }
                };

                return Ok(health);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system health");
                return StatusCode(500, new { message = "Error retrieving system health" });
            }
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }

        private object GetQuickActionsForUser(List<string> roles)
        {
            var actions = new List<object>();

            if (roles.Contains("Admin"))
            {
                actions.AddRange(new object[]
                {
                    new { Name = "Manage Users", Url = "/admin/users", Icon = "users" },
                    new { Name = "Manage Criteria", Url = "/admin/criteria", Icon = "list" },
                    new { Name = "System Health", Url = "/admin/health", Icon = "activity" },
                    new { Name = "Reports", Url = "/admin/reports", Icon = "bar-chart" }
                });
            }

            if (roles.Contains("Evaluator"))
            {
                actions.AddRange(new object[]
                {
                    new { Name = "Start Evaluation", Url = "/evaluations/new", Icon = "plus" },
                    new { Name = "My Team", Url = "/evaluator/team", Icon = "users" },
                    new { Name = "Pending Evaluations", Url = "/evaluations/pending", Icon = "clock" }
                });
            }

            if (roles.Contains("Employee"))
            {
                actions.AddRange(new object[]
                {
                    new { Name = "My Performance", Url = "/employee/performance", Icon = "trending-up" },
                    new { Name = "Evaluation History", Url = "/employee/history", Icon = "history" }
                });
            }

            return actions;
        }
    }
}