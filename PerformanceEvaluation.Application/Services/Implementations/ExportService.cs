using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using PuppeteerSharp;
using PerformanceEvaluation.Application.DTOs.Export;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Core.Enums;
using PerformanceEvaluation.Infrastructure.Data;
using System.Drawing;
using System.Security.Claims;
using System.Text;
using PerformanceEvaluation.Core.Exceptions;
using PuppeteerSharp.Media;

namespace PerformanceEvaluation.Application.Services.Implementations
{
    public class ExportService : IExportService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ExportService> _logger;

        public ExportService(
            ApplicationDbContext context,
            IConfiguration configuration,
            ILogger<ExportService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<byte[]> ExportEvaluationToPdfAsync(int evaluationId, ClaimsPrincipal user)
        {
            var evaluation = await _context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                        .ThenInclude(c => c.CriteriaCategory)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Comments)
                .FirstOrDefaultAsync(e => e.ID == evaluationId);

            if (evaluation == null)
                throw new ArgumentNotFoundException("Evaluation not found");

            // Check access permissions
            var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (!user.IsInRole("Admin") && !user.IsInRole("Manager") && 
                evaluation.EvaluatorID != userId && evaluation.EmployeeID != userId)
            {
                throw new UnauthorizedAccessException("Access denied to this evaluation");
            }

            var html = await GenerateEvaluationHtmlAsync(evaluation);
            return await ConvertHtmlToPdfAsync(html, $"evaluation_{evaluationId}.pdf");
        }

        public async Task<byte[]> ExportEvaluationsToExcelAsync(ExportEvaluationsRequest request, ClaimsPrincipal user)
        {
            var query = _context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Include(e => e.Employee.Department)
                .AsQueryable();

            // Apply filters
            if (request.StartDate.HasValue)
                query = query.Where(e => e.StartDate >= request.StartDate.Value);

            if (request.EndDate.HasValue)
                query = query.Where(e => e.EndDate <= request.EndDate.Value);

            if (request.DepartmentId.HasValue)
                query = query.Where(e => e.Employee.DepartmentID == request.DepartmentId.Value);

            if (request.Status.HasValue)
                query = query.Where(e => e.Status == request.Status.ToString());

            if (request.UserIds.Any())
                query = query.Where(e => request.UserIds.Contains(e.EmployeeID));

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

            var evaluations = await query.ToListAsync();

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Evaluations");

            // Headers
            var headers = new List<string>
            {
                "Evaluation ID", "Employee", "Evaluator", "Department", "Period", 
                "Start Date", "End Date", "Status", "Total Score", "Overall Comments"
            };

            if (request.IncludeScores)
            {
                headers.AddRange(new[] { "Average Score", "Max Score", "Min Score" });
            }

            // Set headers
            for (int i = 0; i < headers.Count; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                worksheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            }

            // Data rows
            for (int i = 0; i < evaluations.Count; i++)
            {
                var eval = evaluations[i];
                var row = i + 2;
                var col = 1;

                worksheet.Cells[row, col++].Value = eval.ID;
                worksheet.Cells[row, col++].Value = $"{eval.Employee.FirstName} {eval.Employee.LastName}";
                worksheet.Cells[row, col++].Value = $"{eval.Evaluator.FirstName} {eval.Evaluator.LastName}";
                worksheet.Cells[row, col++].Value = eval.Employee.Department.Name;
                worksheet.Cells[row, col++].Value = eval.Period;
                worksheet.Cells[row, col++].Value = eval.StartDate.ToString("yyyy-MM-dd");
                worksheet.Cells[row, col++].Value = eval.EndDate.ToString("yyyy-MM-dd");
                worksheet.Cells[row, col++].Value = eval.Status.ToString();
                worksheet.Cells[row, col++].Value = eval.TotalScore.ToString("F2") ?? "N/A";
                worksheet.Cells[row, col++].Value = eval.GeneralComments ?? "";

                if (request.IncludeScores && eval.EvaluationScores.Any())
                {
                    var scores = eval.EvaluationScores.Select(s => s.Score).ToList();
                    worksheet.Cells[row, col++].Value = scores.Average().ToString("F2");
                    worksheet.Cells[row, col++].Value = scores.Max().ToString("F2");
                    worksheet.Cells[row, col++].Value = scores.Min().ToString("F2");
                }
                else if (request.IncludeScores)
                {
                    worksheet.Cells[row, col++].Value = "N/A";
                    worksheet.Cells[row, col++].Value = "N/A";
                    worksheet.Cells[row, col++].Value = "N/A";
                }
            }

            // Include detailed scores if requested
            if (request.IncludeScores)
            {
                await AddDetailedScoresSheet(package, evaluations);
            }

            // Include comments if requested
            if (request.IncludeComments)
            {
                await AddCommentsSheet(package, evaluations);
            }

            worksheet.Cells.AutoFitColumns();
            return package.GetAsByteArray();
        }

        public async Task<byte[]> ExportUsersToExcelAsync(ExportUsersRequest request, ClaimsPrincipal user)
        {
            var query = _context.Users
                .Include(u => u.Department)
                .Include(u => u.RoleAssignments)
                    .ThenInclude(ra => ra.Role)
                .AsQueryable();

            // Apply filters
            if (request.DepartmentId.HasValue)
                query = query.Where(u => u.DepartmentID == request.DepartmentId.Value);

            if (request.IsActive.HasValue)
                query = query.Where(u => u.IsActive == request.IsActive.Value);

            if (request.SystemRoles.Any())
            {
                query = query.Where(u => u.RoleAssignments.Any(ra => request.SystemRoles.Contains(ra.Role.Name)));
            }

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

            var users = await query.ToListAsync();

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Users");

            // Headers
            var headers = new List<string>
            {
                "User ID", "First Name", "Last Name", "Email", "Department", 
                "Is Active", "Created Date", "Updated Date"
            };

            if (request.IncludeRoleAssignments)
            {
                headers.Add("System Roles");
                headers.Add("Job Roles");
            }

            if (request.IncludePerformanceMetrics)
            {
                headers.AddRange(new[] { "Total Evaluations", "Average Score", "Last Evaluation Date" });
            }

            // Set headers
            for (int i = 0; i < headers.Count; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                worksheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            }

            // Data rows
            for (int i = 0; i < users.Count; i++)
            {
                var user_ = users[i];
                var row = i + 2;
                var col = 1;

                worksheet.Cells[row, col++].Value = user_.ID;
                worksheet.Cells[row, col++].Value = user_.FirstName;
                worksheet.Cells[row, col++].Value = user_.LastName;
                worksheet.Cells[row, col++].Value = user_.Email;
                worksheet.Cells[row, col++].Value = user_.Department?.Name ?? "N/A";
                worksheet.Cells[row, col++].Value = user_.IsActive ? "Yes" : "No";
                worksheet.Cells[row, col++].Value = user_.CreatedDate.ToString("yyyy-MM-dd HH:mm");
                worksheet.Cells[row, col++].Value = user_.UpdatedDate?.ToString("yyyy-MM-dd HH:mm") ?? "N/A";

                if (request.IncludeRoleAssignments)
                {
                    var systemRoles = string.Join(", ", user_.RoleAssignments.Where(ra => ra.RoleID <= 3).Select(ra => ra.Role.Name));
                    var jobRoles = string.Join(", ", user_.RoleAssignments.Where(ra => ra.RoleID > 3).Select(ra => ra.Role.Name));
                    
                    worksheet.Cells[row, col++].Value = systemRoles;
                    worksheet.Cells[row, col++].Value = jobRoles;
                }

                if (request.IncludePerformanceMetrics)
                {
                    var evaluations = await _context.Evaluations
                        .Where(e => e.EmployeeID == user_.ID)
                        .ToListAsync();

                    worksheet.Cells[row, col++].Value = evaluations.Count;
                    worksheet.Cells[row, col++].Value = evaluations.Any() ? 
                        evaluations.Where(e => e.TotalScore > 0).Average(e => e.TotalScore).ToString("F2") : "N/A";
                    worksheet.Cells[row, col++].Value = evaluations.Any() ? 
                        evaluations.Max(e => e.EndDate).ToString("yyyy-MM-dd") : "N/A";
                }
            }

            worksheet.Cells.AutoFitColumns();
            return package.GetAsByteArray();
        }

        public async Task<byte[]> ExportDepartmentReportToPdfAsync(int departmentId, DateTime startDate, DateTime endDate, ClaimsPrincipal user)
        {
            var department = await _context.Departments
                .Include(d => d.Users)
                    .ThenInclude(u => u.EmployeeEvaluations.Where(e => e.StartDate >= startDate && e.EndDate <= endDate))
                        .ThenInclude(e => e.EvaluationScores)
                .FirstOrDefaultAsync(d => d.ID == departmentId);

            if (department == null)
                throw new ArgumentNotFoundException("Department not found");

            // Check access permissions
            if (!user.IsInRole("Admin") && !user.IsInRole("Manager"))
            {
                throw new UnauthorizedAccessException("Access denied");
            }

            if (user.IsInRole("Manager"))
            {
                var userDepartmentId = int.Parse(user.FindFirst("DepartmentID")?.Value ?? "0");
                if (userDepartmentId != departmentId)
                {
                    throw new UnauthorizedAccessException("Access denied to this department");
                }
            }

            var html = await GenerateDepartmentReportHtmlAsync(department, startDate, endDate);
            return await ConvertHtmlToPdfAsync(html, $"department_report_{departmentId}_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.pdf");
        }

        public async Task<byte[]> ExportPerformanceReportToPdfAsync(PerformanceReportRequest request, ClaimsPrincipal user)
        {
            var query = _context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Include(e => e.Employee.Department)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                .Where(e => e.StartDate >= request.StartDate && e.EndDate <= request.EndDate);

            if (request.DepartmentId.HasValue)
                query = query.Where(e => e.Employee.DepartmentID == request.DepartmentId.Value);

            if (request.TeamId.HasValue)
            {
                // Assuming team assignments exist
                query = query.Where(e => e.Employee.EvaluatorAssignments.Any(ea => ea.TeamID == request.TeamId.Value));
            }

            if (request.UserIds.Any())
                query = query.Where(e => request.UserIds.Contains(e.EmployeeID));

            var evaluations = await query.ToListAsync();

            var html = await GeneratePerformanceReportHtmlAsync(evaluations, request);
            return await ConvertHtmlToPdfAsync(html, $"performance_report_{request.StartDate:yyyyMMdd}_{request.EndDate:yyyyMMdd}.pdf");
        }

        public async Task<byte[]> GenerateComprehensiveReportAsync(ComprehensiveReportRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin") && !user.IsInRole("Manager"))
                throw new UnauthorizedAccessException("Access denied");

            var query = _context.Evaluations
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Include(e => e.Employee.Department)
                .Include(e => e.EvaluationScores)
                    .ThenInclude(es => es.Criteria)
                        .ThenInclude(c => c.CriteriaCategory)
                .Where(e => e.StartDate >= request.StartDate && e.EndDate <= request.EndDate);

            if (request.DepartmentIds.Any())
                query = query.Where(e => request.DepartmentIds.Contains(e.Employee.DepartmentID));

            var evaluations = await query.ToListAsync();
            var departments = await _context.Departments.Where(d => request.DepartmentIds.Contains(d.ID)).ToListAsync();

            var html = await GenerateComprehensiveReportHtmlAsync(evaluations, departments, request);
            return await ConvertHtmlToPdfAsync(html, $"comprehensive_report_{request.ReportType}_{request.StartDate:yyyyMMdd}_{request.EndDate:yyyyMMdd}.pdf");
        }

        private async Task<string> GenerateEvaluationHtmlAsync(Core.Entities.Evaluation evaluation)
        {
            var companyName = _configuration["Export:PdfSettings:CompanyName"] ?? "Performance Evaluation System";
            
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html>");
            html.AppendLine("<head>");
            html.AppendLine("<meta charset='UTF-8'>");
            html.AppendLine("<title>Performance Evaluation Report</title>");
            html.AppendLine("<style>");
            html.AppendLine(@"
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                .company-name { font-size: 24px; font-weight: bold; color: #333; }
                .report-title { font-size: 20px; color: #666; margin-top: 10px; }
                .section { margin-bottom: 30px; }
                .section-title { font-size: 18px; font-weight: bold; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
                .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .info-table td { padding: 8px; border: 1px solid #ddd; }
                .info-table .label { font-weight: bold; background-color: #f5f5f5; width: 30%; }
                .scores-table { width: 100%; border-collapse: collapse; }
                .scores-table th, .scores-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                .scores-table th { background-color: #f5f5f5; font-weight: bold; }
                .score-good { background-color: #d4edda; }
                .score-average { background-color: #fff3cd; }
                .score-poor { background-color: #f8d7da; }
                .comments { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin-top: 10px; }
                .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
            ");
            html.AppendLine("</style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");

            // Header
            html.AppendLine("<div class='header'>");
            html.AppendLine($"<div class='company-name'>{companyName}</div>");
            html.AppendLine("<div class='report-title'>Performance Evaluation Report</div>");
            html.AppendLine("</div>");

            // Basic Information
            html.AppendLine("<div class='section'>");
            html.AppendLine("<div class='section-title'>Evaluation Information</div>");
            html.AppendLine("<table class='info-table'>");
            html.AppendLine($"<tr><td class='label'>Employee</td><td>{evaluation.Employee.FirstName} {evaluation.Employee.LastName}</td></tr>");
            html.AppendLine($"<tr><td class='label'>Evaluator</td><td>{evaluation.Evaluator.FirstName} {evaluation.Evaluator.LastName}</td></tr>");
            html.AppendLine($"<tr><td class='label'>Period</td><td>{evaluation.Period}</td></tr>");
            html.AppendLine($"<tr><td class='label'>Evaluation Period</td><td>{evaluation.StartDate:yyyy-MM-dd} to {evaluation.EndDate:yyyy-MM-dd}</td></tr>");
            html.AppendLine($"<tr><td class='label'>Status</td><td>{evaluation.Status}</td></tr>");
            html.AppendLine($"<tr><td class='label'>Total Score</td><td>{evaluation.TotalScore.ToString("F2") ?? "N/A"}</td></tr>");
            html.AppendLine("</table>");
            html.AppendLine("</div>");

            // Scores by Category
            if (evaluation.EvaluationScores.Any())
            {
                html.AppendLine("<div class='section'>");
                html.AppendLine("<div class='section-title'>Detailed Scores</div>");
                html.AppendLine("<table class='scores-table'>");
                html.AppendLine("<tr><th>Category</th><th>Criteria</th><th>Score</th><th>Comments</th></tr>");

                var scoresByCategory = evaluation.EvaluationScores
                    .GroupBy(s => s.Criteria.CriteriaCategory.Name)
                    .OrderBy(g => g.Key);

                foreach (var categoryGroup in scoresByCategory)
                {
                    foreach (var score in categoryGroup.OrderBy(s => s.Criteria.Name))
                    {
                        var scoreClass = score.Score >= 4 ? "score-good" : score.Score >= 3 ? "score-average" : "score-poor";
                        var comments = string.Join("; ", score.Comments.Select(c => c.Description));
                        
                        html.AppendLine($"<tr class='{scoreClass}'>");
                        html.AppendLine($"<td>{score.Criteria.CriteriaCategory.Name}</td>");
                        html.AppendLine($"<td>{score.Criteria.Name}</td>");
                        html.AppendLine($"<td>{score.Score:F1}</td>");
                        html.AppendLine($"<td>{comments}</td>");
                        html.AppendLine("</tr>");
                    }
                }

                html.AppendLine("</table>");
                html.AppendLine("</div>");
            }

            // Overall Comments
            if (!string.IsNullOrEmpty(evaluation.GeneralComments))
            {
                html.AppendLine("<div class='section'>");
                html.AppendLine("<div class='section-title'>Overall Comments</div>");
                html.AppendLine($"<div class='comments'>{evaluation.GeneralComments}</div>");
                html.AppendLine("</div>");
            }

            // Footer
            html.AppendLine("<div class='footer'>");
            html.AppendLine($"Generated on {DateTime.Now:yyyy-MM-dd HH:mm} | {companyName}");
            html.AppendLine("</div>");

            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString();
        }

        private async Task<string> GenerateDepartmentReportHtmlAsync(Core.Entities.Department department, DateTime startDate, DateTime endDate)
        {
            var companyName = _configuration["Export:PdfSettings:CompanyName"] ?? "Performance Evaluation System";
            
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html>");
            html.AppendLine("<head>");
            html.AppendLine("<meta charset='UTF-8'>");
            html.AppendLine("<title>Department Performance Report</title>");
            html.AppendLine("<style>");
            html.AppendLine(@"
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                .company-name { font-size: 24px; font-weight: bold; color: #333; }
                .report-title { font-size: 20px; color: #666; margin-top: 10px; }
                .section { margin-bottom: 30px; }
                .section-title { font-size: 18px; font-weight: bold; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
                .summary-stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
                .stat-box { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
                .stat-label { font-size: 14px; color: #666; }
                .employee-table { width: 100%; border-collapse: collapse; }
                .employee-table th, .employee-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                .employee-table th { background-color: #f5f5f5; font-weight: bold; }
            ");
            html.AppendLine("</style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");

            // Header
            html.AppendLine("<div class='header'>");
            html.AppendLine($"<div class='company-name'>{companyName}</div>");
            html.AppendLine($"<div class='report-title'>Department Performance Report - {department.Name}</div>");
            html.AppendLine($"<div>Period: {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}</div>");
            html.AppendLine("</div>");

            // Summary Statistics
            var allEvaluations = department.Users.SelectMany(u => u.EmployeeEvaluations).ToList();
            var completedEvaluations = allEvaluations.Where(e => e.Status == "Completed").ToList();
            var averageScore = completedEvaluations.Where(e => e.TotalScore > 0).Select(e => e.TotalScore).DefaultIfEmpty(0).Average();

            html.AppendLine("<div class='summary-stats'>");
            html.AppendLine("<div class='stat-box'>");
            html.AppendLine($"<div class='stat-number'>{department.Users.Count}</div>");
            html.AppendLine("<div class='stat-label'>Total Employees</div>");
            html.AppendLine("</div>");
            html.AppendLine("<div class='stat-box'>");
            html.AppendLine($"<div class='stat-number'>{allEvaluations.Count}</div>");
            html.AppendLine("<div class='stat-label'>Total Evaluations</div>");
            html.AppendLine("</div>");
            html.AppendLine("<div class='stat-box'>");
            html.AppendLine($"<div class='stat-number'>{completedEvaluations.Count}</div>");
            html.AppendLine("<div class='stat-label'>Completed Evaluations</div>");
            html.AppendLine("</div>");
            html.AppendLine("<div class='stat-box'>");
            html.AppendLine($"<div class='stat-number'>{averageScore:F1}</div>");
            html.AppendLine("<div class='stat-label'>Average Score</div>");
            html.AppendLine("</div>");
            html.AppendLine("</div>");

            // Employee Performance Table
            html.AppendLine("<div class='section'>");
            html.AppendLine("<div class='section-title'>Employee Performance Summary</div>");
            html.AppendLine("<table class='employee-table'>");
            html.AppendLine("<tr><th>Employee</th><th>Total Evaluations</th><th>Completed</th><th>Average Score</th><th>Last Evaluation</th></tr>");

            foreach (var user in department.Users.OrderBy(u => u.LastName))
            {
                var userEvaluations = user.EmployeeEvaluations.ToList();
                var userCompleted = userEvaluations.Where(e => e.Status == "Completed").ToList();
                var userAverage = userCompleted.Where(e => e.TotalScore > 0).Select(e => e.TotalScore).DefaultIfEmpty(0).Average();
                var lastEvaluation = userEvaluations.OrderByDescending(e => e.EndDate).FirstOrDefault();

                html.AppendLine("<tr>");
                html.AppendLine($"<td>{user.FirstName} {user.LastName}</td>");
                html.AppendLine($"<td>{userEvaluations.Count}</td>");
                html.AppendLine($"<td>{userCompleted.Count}</td>");
                html.AppendLine($"<td>{(userAverage > 0 ? userAverage.ToString("F1") : "N/A")}</td>");
                html.AppendLine($"<td>{lastEvaluation?.EndDate.ToString("yyyy-MM-dd") ?? "N/A"}</td>");
                html.AppendLine("</tr>");
            }

            html.AppendLine("</table>");
            html.AppendLine("</div>");

            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString();
        }

        private async Task<string> GeneratePerformanceReportHtmlAsync(List<Core.Entities.Evaluation> evaluations, PerformanceReportRequest request)
        {
            // Similar implementation for performance reports
            var html = new StringBuilder();
            // Implementation would be similar to department report but with different analytics
            return html.ToString();
        }

        private async Task<string> GenerateComprehensiveReportHtmlAsync(List<Core.Entities.Evaluation> evaluations, List<Core.Entities.Department> departments, ComprehensiveReportRequest request)
        {
            // Implementation for comprehensive reports with executive summary, detailed analysis, etc.
            var html = new StringBuilder();
            // Complex implementation with multiple sections
            return html.ToString();
        }

        private async Task<byte[]> ConvertHtmlToPdfAsync(string html, string fileName)
        {
            try
            {
                // Initialize Puppeteer
                await new BrowserFetcher().DownloadAsync();
                using var browser = await Puppeteer.LaunchAsync(new LaunchOptions
                {
                    Headless = true,
                    Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
                });

                using var page = await browser.NewPageAsync();
                await page.SetContentAsync(html);

                var pdfOptions = new PdfOptions
                {
                    Format = PaperFormat.A4,
                    PrintBackground = true,
                    MarginOptions = new MarginOptions
                    {
                        Top = "20mm",
                        Right = "20mm",
                        Bottom = "20mm",
                        Left = "20mm"
                    }
                };

                return await page.PdfDataAsync(pdfOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error converting HTML to PDF");
                throw new InvalidOperationException("Failed to generate PDF", ex);
            }
        }

        private async Task AddDetailedScoresSheet(ExcelPackage package, List<Core.Entities.Evaluation> evaluations)
        {
            var worksheet = package.Workbook.Worksheets.Add("Detailed Scores");

            var headers = new[] { "Evaluation ID", "Employee", "Category", "Criteria", "Score", "Comments" };
            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                worksheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            }

            int row = 2;
            foreach (var evaluation in evaluations)
            {
                foreach (var score in evaluation.EvaluationScores)
                {
                    worksheet.Cells[row, 1].Value = evaluation.ID;
                    worksheet.Cells[row, 2].Value = $"{evaluation.Employee.FirstName} {evaluation.Employee.LastName}";
                    worksheet.Cells[row, 3].Value = score.Criteria.CriteriaCategory.Name;
                    worksheet.Cells[row, 4].Value = score.Criteria.Name;
                    worksheet.Cells[row, 5].Value = score.Score;
                    worksheet.Cells[row, 6].Value = string.Join("; ", score.Comments.Select(c => c.Description));
                    row++;
                }
            }

            worksheet.Cells.AutoFitColumns();
        }

        private async Task AddCommentsSheet(ExcelPackage package, List<Core.Entities.Evaluation> evaluations)
        {
            var worksheet = package.Workbook.Worksheets.Add("Comments");

            var headers = new[] { "Evaluation ID", "Employee", "Criteria", "Comment", "Created Date" };
            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                worksheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            }

            int row = 2;
            foreach (var evaluation in evaluations)
            {
                foreach (var score in evaluation.EvaluationScores)
                {
                    foreach (var comment in score.Comments)
                    {
                        worksheet.Cells[row, 1].Value = evaluation.ID;
                        worksheet.Cells[row, 2].Value = $"{evaluation.Employee.FirstName} {evaluation.Employee.LastName}";
                        worksheet.Cells[row, 3].Value = score.Criteria.Name;
                        worksheet.Cells[row, 4].Value = comment.Description;
                        worksheet.Cells[row, 5].Value = comment.CreatedDate.ToString("yyyy-MM-dd HH:mm");
                        row++;
                    }
                }
            }

            worksheet.Cells.AutoFitColumns();
        }
    }
}