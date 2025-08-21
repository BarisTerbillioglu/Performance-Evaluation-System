using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using PerformanceEvaluation.Application.DTOs.BulkOperations;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Data;
using System.Security.Claims;

namespace PerformanceEvaluation.Application.Services.Implementations
{
    /// <summary>
    /// Implementation of bulk operations service
    /// </summary>
    public class BulkOperationService : IBulkOperationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BulkOperationService> _logger;

        public BulkOperationService(ApplicationDbContext context, ILogger<BulkOperationService> logger)
        {
            _context = context;
            _logger = logger;
            
            // Set EPPlus license context
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        public async Task<BulkImportResultDto> ImportUsersAsync(IFormFile file, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
                throw new UnauthorizedAccessException("Only administrators can import users");

            var result = new BulkImportResultDto { FileName = file.FileName };

            try
            {
                using var stream = file.OpenReadStream();
                using var package = new ExcelPackage(stream);
                var worksheet = package.Workbook.Worksheets.FirstOrDefault();

                if (worksheet == null)
                {
                    result.Errors.Add("No worksheet found in the Excel file");
                    return result;
                }

                // Get lookup data
                var departments = await _context.Departments.ToDictionaryAsync(d => d.Name.ToLower(), d => d);
                var systemRoles = await _context.Roles.Where(r => r.ID <= 3).ToDictionaryAsync(r => r.Name.ToLower(), r => r);

                result.TotalRows = Math.Max(0, worksheet.Dimension?.Rows - 1 ?? 0);

                // Process each row (skip header)
                for (int row = 2; row <= (worksheet.Dimension?.Rows ?? 1); row++)
                {
                    try
                    {
                        var userImport = ExtractUserFromRow(worksheet, row);
                        var rowResult = await ProcessUserImportRow(userImport, departments, systemRoles, row);
                        result.RowResults.Add(rowResult);

                        if (rowResult.Success)
                            result.SuccessfulRows++;
                        else
                            result.FailedRows++;
                    }
                    catch (Exception ex)
                    {
                        result.RowResults.Add(new ImportRowResult
                        {
                            RowNumber = row,
                            Success = false,
                            Error = $"Error processing row: {ex.Message}"
                        });
                        result.FailedRows++;
                    }
                }

                await _context.SaveChangesAsync();
                result.Success = result.SuccessfulRows > 0;
                result.Message = $"Import completed. {result.SuccessfulRows} users imported successfully, {result.FailedRows} failed.";

                _logger.LogInformation("Bulk user import completed by {UserId}: {Success}/{Total}", 
                    GetUserId(user), result.SuccessfulRows, result.TotalRows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during bulk user import");
                result.Errors.Add($"Import failed: {ex.Message}");
            }

            return result;
        }

        public async Task<BulkImportResultDto> ImportEvaluationsAsync(IFormFile file, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin") && !user.IsInRole("Manager"))
                throw new UnauthorizedAccessException("Only administrators and managers can import evaluations");

            var result = new BulkImportResultDto { FileName = file.FileName };

            try
            {
                using var stream = file.OpenReadStream();
                using var package = new ExcelPackage(stream);
                var worksheet = package.Workbook.Worksheets.FirstOrDefault();

                if (worksheet == null)
                {
                    result.Errors.Add("No worksheet found in the Excel file");
                    return result;
                }

                var users = await _context.Users.ToDictionaryAsync(u => u.Email.ToLower(), u => u);
                result.TotalRows = Math.Max(0, worksheet.Dimension?.Rows - 1 ?? 0);

                for (int row = 2; row <= (worksheet.Dimension?.Rows ?? 1); row++)
                {
                    try
                    {
                        var evaluationImport = ExtractEvaluationFromRow(worksheet, row, users);
                        var rowResult = await ProcessEvaluationImportRow(evaluationImport, row);
                        result.RowResults.Add(rowResult);

                        if (rowResult.Success)
                            result.SuccessfulRows++;
                        else
                            result.FailedRows++;
                    }
                    catch (Exception ex)
                    {
                        result.RowResults.Add(new ImportRowResult
                        {
                            RowNumber = row,
                            Success = false,
                            Error = $"Error processing row: {ex.Message}"
                        });
                        result.FailedRows++;
                    }
                }

                await _context.SaveChangesAsync();
                result.Success = result.SuccessfulRows > 0;
                result.Message = $"Import completed. {result.SuccessfulRows} evaluations imported successfully, {result.FailedRows} failed.";

                _logger.LogInformation("Bulk evaluation import completed by {UserId}: {Success}/{Total}", 
                    GetUserId(user), result.SuccessfulRows, result.TotalRows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during bulk evaluation import");
                result.Errors.Add($"Import failed: {ex.Message}");
            }

            return result;
        }

        public async Task<BulkOperationResultDto> BulkUpdateUserStatusAsync(BulkUpdateStatusRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
                throw new UnauthorizedAccessException("Only administrators can bulk update user status");

            var result = new BulkOperationResultDto { TotalItems = request.UserIds.Count };

            try
            {
                var users = await _context.Users
                    .Where(u => request.UserIds.Contains(u.ID))
                    .ToListAsync();

                foreach (var userId in request.UserIds)
                {
                    var userToUpdate = users.FirstOrDefault(u => u.ID == userId);
                    if (userToUpdate != null)
                    {
                        userToUpdate.IsActive = request.IsActive;
                        userToUpdate.UpdatedDate = DateTime.UtcNow;
                        result.SuccessfulItems++;
                    }
                    else
                    {
                        result.Errors.Add($"User with ID {userId} not found");
                        result.FailedItems++;
                    }
                }

                await _context.SaveChangesAsync();
                result.Success = result.SuccessfulItems > 0;
                result.Message = $"Bulk status update completed. {result.SuccessfulItems} users updated successfully.";

                _logger.LogInformation("Bulk user status update by {UserId}: {Success}/{Total} users {Status}", 
                    GetUserId(user), result.SuccessfulItems, result.TotalItems, request.IsActive ? "activated" : "deactivated");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during bulk user status update");
                result.Errors.Add($"Bulk update failed: {ex.Message}");
            }

            return result;
        }

        public async Task<BulkOperationResultDto> BulkAssignEvaluatorsAsync(BulkAssignEvaluatorsRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin") && !user.IsInRole("Manager"))
                throw new UnauthorizedAccessException("Only administrators and managers can bulk assign evaluators");

            var result = new BulkOperationResultDto { TotalItems = request.Assignments.Count };

            try
            {
                foreach (var assignment in request.Assignments)
                {
                    try
                    {
                        var existingAssignment = await _context.EvaluatorAssignments
                            .FirstOrDefaultAsync(ea => ea.EvaluatorID == assignment.EvaluatorId 
                                                    && ea.EmployeeID == assignment.EmployeeId
                                                    && ea.TeamID == assignment.TeamId);

                        if (existingAssignment == null)
                        {
                            var newAssignment = new EvaluatorAssignment
                            {
                                EvaluatorID = assignment.EvaluatorId,
                                EmployeeID = assignment.EmployeeId,
                                TeamID = assignment.TeamId,
                                AssignedDate = assignment.AssignedDate,
                                IsActive = true
                            };

                            _context.EvaluatorAssignments.Add(newAssignment);
                            result.SuccessfulItems++;
                        }
                        else
                        {
                            result.Errors.Add($"Assignment already exists for evaluator {assignment.EvaluatorId} and employee {assignment.EmployeeId}");
                            result.FailedItems++;
                        }
                    }
                    catch (Exception ex)
                    {
                        result.Errors.Add($"Error assigning evaluator {assignment.EvaluatorId} to employee {assignment.EmployeeId}: {ex.Message}");
                        result.FailedItems++;
                    }
                }

                await _context.SaveChangesAsync();
                result.Success = result.SuccessfulItems > 0;
                result.Message = $"Bulk evaluator assignment completed. {result.SuccessfulItems} assignments created successfully.";

                _logger.LogInformation("Bulk evaluator assignment by {UserId}: {Success}/{Total}", 
                    GetUserId(user), result.SuccessfulItems, result.TotalItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during bulk evaluator assignment");
                result.Errors.Add($"Bulk assignment failed: {ex.Message}");
            }

            return result;
        }

        public async Task<BulkOperationResultDto> BulkCreateEvaluationsAsync(BulkCreateEvaluationsRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin") && !user.IsInRole("Manager"))
                throw new UnauthorizedAccessException("Only administrators and managers can bulk create evaluations");

            var result = new BulkOperationResultDto { TotalItems = request.Evaluations.Count };

            try
            {
                foreach (var evalDto in request.Evaluations)
                {
                    try
                    {
                        var evaluation = new Evaluation
                        {
                            EmployeeID = evalDto.EvaluatedID,
                            EvaluatorID = evalDto.EvaluatorID,
                            Period = evalDto.Period,
                            StartDate = evalDto.StartDate,
                            EndDate = evalDto.EndDate,
                            Status = "Pending",
                            GeneralComments = evalDto.OverallComments,
                            CreatedDate = DateTime.UtcNow
                        };

                        _context.Evaluations.Add(evaluation);
                        result.SuccessfulItems++;
                    }
                    catch (Exception ex)
                    {
                        result.Errors.Add($"Error creating evaluation for employee {evalDto.EvaluatedID}: {ex.Message}");
                        result.FailedItems++;
                    }
                }

                await _context.SaveChangesAsync();
                result.Success = result.SuccessfulItems > 0;
                result.Message = $"Bulk evaluation creation completed. {result.SuccessfulItems} evaluations created successfully.";

                _logger.LogInformation("Bulk evaluation creation by {UserId}: {Success}/{Total}", 
                    GetUserId(user), result.SuccessfulItems, result.TotalItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during bulk evaluation creation");
                result.Errors.Add($"Bulk creation failed: {ex.Message}");
            }

            return result;
        }

        public async Task<byte[]> GenerateUserImportTemplateAsync()
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("User Import Template");

            // Headers
            var headers = new[] { "FirstName", "LastName", "Email", "DepartmentName", "JobTitle", "IsActive", "SystemRole", "JobRole" };
            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                worksheet.Cells[1, i + 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
            }

            // Sample data
            worksheet.Cells[2, 1].Value = "John";
            worksheet.Cells[2, 2].Value = "Doe";
            worksheet.Cells[2, 3].Value = "john.doe@company.com";
            worksheet.Cells[2, 4].Value = "IT";
            worksheet.Cells[2, 5].Value = "Software Developer";
            worksheet.Cells[2, 6].Value = "TRUE";
            worksheet.Cells[2, 7].Value = "Employee";
            worksheet.Cells[2, 8].Value = "Developer";

            worksheet.Cells[3, 1].Value = "Jane";
            worksheet.Cells[3, 2].Value = "Smith";
            worksheet.Cells[3, 3].Value = "jane.smith@company.com";
            worksheet.Cells[3, 4].Value = "HR";
            worksheet.Cells[3, 5].Value = "HR Manager";
            worksheet.Cells[3, 6].Value = "TRUE";
            worksheet.Cells[3, 7].Value = "Manager";
            worksheet.Cells[3, 8].Value = "Manager";

            worksheet.Cells.AutoFitColumns();
            return package.GetAsByteArray();
        }

        public async Task<byte[]> GenerateEvaluationImportTemplateAsync()
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Evaluation Import Template");

            var headers = new[] { "EmployeeEmail", "EvaluatorEmail", "Period", "StartDate", "EndDate", "OverallComments" };
            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                worksheet.Cells[1, i + 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
            }

            worksheet.Cells[2, 1].Value = "john.doe@company.com";
            worksheet.Cells[2, 2].Value = "manager@company.com";
            worksheet.Cells[2, 3].Value = "Q1 2025";
            worksheet.Cells[2, 4].Value = "2025-01-01";
            worksheet.Cells[2, 5].Value = "2025-03-31";
            worksheet.Cells[2, 6].Value = "Quarterly performance evaluation";

            worksheet.Cells.AutoFitColumns();
            return package.GetAsByteArray();
        }

        public async Task<List<string>> ValidateImportFileAsync(IFormFile file, string importType)
        {
            var errors = new List<string>();

            if (file == null || file.Length == 0)
            {
                errors.Add("File is required");
                return errors;
            }

            var allowedExtensions = new[] { ".xlsx", ".xls" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(fileExtension))
            {
                errors.Add($"Invalid file format. Allowed formats: {string.Join(", ", allowedExtensions)}");
                return errors;
            }

            try
            {
                using var stream = file.OpenReadStream();
                using var package = new ExcelPackage(stream);
                var worksheet = package.Workbook.Worksheets.FirstOrDefault();

                if (worksheet == null)
                {
                    errors.Add("No worksheet found in the Excel file");
                    return errors;
                }

                // Validate headers based on import type
                var expectedHeaders = importType.ToLower() switch
                {
                    "users" => new[] { "FirstName", "LastName", "Email", "DepartmentName", "JobTitle", "IsActive", "SystemRole", "JobRole" },
                    "evaluations" => new[] { "EmployeeEmail", "EvaluatorEmail", "Period", "StartDate", "EndDate", "OverallComments" },
                    _ => new string[0]
                };

                if (expectedHeaders.Length == 0)
                {
                    errors.Add($"Unknown import type: {importType}");
                    return errors;
                }

                // Check headers
                for (int i = 0; i < expectedHeaders.Length; i++)
                {
                    var cellValue = worksheet.Cells[1, i + 1].Value?.ToString();
                    if (cellValue != expectedHeaders[i])
                    {
                        errors.Add($"Expected header '{expectedHeaders[i]}' at column {i + 1}, found '{cellValue}'");
                    }
                }
            }
            catch (Exception ex)
            {
                errors.Add($"Error reading Excel file: {ex.Message}");
            }

            return errors;
        }

        public async Task<object> GetImportPreviewAsync(IFormFile file, string importType)
        {
            using var stream = file.OpenReadStream();
            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets.FirstOrDefault();

            if (worksheet == null)
                throw new InvalidOperationException("No worksheet found in the Excel file");

            var preview = new List<Dictionary<string, object>>();
            var maxRows = Math.Min(10, worksheet.Dimension?.Rows ?? 0); // First 10 rows

            // Get headers
            var headers = new List<string>();
            for (int col = 1; col <= (worksheet.Dimension?.Columns ?? 0); col++)
            {
                headers.Add(worksheet.Cells[1, col].Value?.ToString() ?? $"Column{col}");
            }

            // Get data rows
            for (int row = 2; row <= maxRows; row++)
            {
                var rowData = new Dictionary<string, object>();
                for (int col = 1; col <= headers.Count; col++)
                {
                    rowData[headers[col - 1]] = worksheet.Cells[row, col].Value ?? "";
                }
                preview.Add(rowData);
            }

            return new
            {
                Headers = headers,
                Data = preview,
                TotalRows = Math.Max(0, (worksheet.Dimension?.Rows ?? 1) - 1),
                PreviewRows = preview.Count
            };
        }

        #region Private Helper Methods

        private UserImportDto ExtractUserFromRow(ExcelWorksheet worksheet, int row)
        {
            return new UserImportDto
            {
                FirstName = worksheet.Cells[row, 1].Value?.ToString()?.Trim() ?? "",
                LastName = worksheet.Cells[row, 2].Value?.ToString()?.Trim() ?? "",
                Email = worksheet.Cells[row, 3].Value?.ToString()?.Trim() ?? "",
                DepartmentName = worksheet.Cells[row, 4].Value?.ToString()?.Trim() ?? "",
                JobTitle = worksheet.Cells[row, 5].Value?.ToString()?.Trim(),
                IsActive = bool.Parse(worksheet.Cells[row, 6].Value?.ToString() ?? "true"),
                SystemRole = worksheet.Cells[row, 7].Value?.ToString()?.Trim(),
                JobRole = worksheet.Cells[row, 8].Value?.ToString()?.Trim()
            };
        }

        private EvaluationImportDto ExtractEvaluationFromRow(ExcelWorksheet worksheet, int row, Dictionary<string, User> users)
        {
            var employeeEmail = worksheet.Cells[row, 1].Value?.ToString()?.Trim() ?? "";
            var evaluatorEmail = worksheet.Cells[row, 2].Value?.ToString()?.Trim() ?? "";

            return new EvaluationImportDto
            {
                EmployeeEmail = employeeEmail,
                EvaluatorEmail = evaluatorEmail,
                Period = worksheet.Cells[row, 3].Value?.ToString()?.Trim() ?? "",
                StartDate = DateTime.Parse(worksheet.Cells[row, 4].Value?.ToString() ?? DateTime.Now.ToString()),
                EndDate = DateTime.Parse(worksheet.Cells[row, 5].Value?.ToString() ?? DateTime.Now.AddMonths(3).ToString()),
                OverallComments = worksheet.Cells[row, 6].Value?.ToString()?.Trim()
            };
        }

        private async Task<ImportRowResult> ProcessUserImportRow(
            UserImportDto userImport, 
            Dictionary<string, Department> departments,
            Dictionary<string, Role> systemRoles,
            int rowNumber)
        {
            var rowResult = new ImportRowResult { RowNumber = rowNumber };

            try
            {
                // Validation
                if (string.IsNullOrEmpty(userImport.Email) || !userImport.Email.Contains("@"))
                {
                    rowResult.Error = "Invalid email address";
                    return rowResult;
                }

                if (await _context.Users.AnyAsync(u => u.Email.ToLower() == userImport.Email.ToLower()))
                {
                    rowResult.Error = "User with this email already exists";
                    return rowResult;
                }

                if (!departments.TryGetValue(userImport.DepartmentName.ToLower(), out var department))
                {
                    rowResult.Error = $"Department '{userImport.DepartmentName}' not found";
                    return rowResult;
                }

                var user = new User
                {
                    FirstName = userImport.FirstName,
                    LastName = userImport.LastName,
                    Email = userImport.Email.ToLower(),
                    DepartmentID = department.ID,
                    IsActive = userImport.IsActive,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("TempPassword123!"),
                    CreatedDate = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync(); // Save to get user ID

                // Assign system role if specified
                if (!string.IsNullOrEmpty(userImport.SystemRole) && 
                    systemRoles.TryGetValue(userImport.SystemRole.ToLower(), out var systemRole))
                {
                    var roleAssignment = new RoleAssignment
                    {
                        UserID = user.ID,
                        RoleID = systemRole.ID,
                        AssignedDate = DateTime.UtcNow
                    };
                    _context.RoleAssignments.Add(roleAssignment);
                }

                rowResult.Success = true;
                rowResult.Data = new { UserId = user.ID, Email = user.Email };
                rowResult.EntityId = user.ID.ToString();
            }
            catch (Exception ex)
            {
                rowResult.Error = ex.Message;
            }

            return rowResult;
        }

        private async Task<ImportRowResult> ProcessEvaluationImportRow(EvaluationImportDto evaluationImport, int rowNumber)
        {
            var rowResult = new ImportRowResult { RowNumber = rowNumber };

            try
            {
                var employee = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == evaluationImport.EmployeeEmail.ToLower());
                var evaluator = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == evaluationImport.EvaluatorEmail.ToLower());

                if (employee == null)
                {
                    rowResult.Error = $"Employee with email '{evaluationImport.EmployeeEmail}' not found";
                    return rowResult;
                }

                if (evaluator == null)
                {
                    rowResult.Error = $"Evaluator with email '{evaluationImport.EvaluatorEmail}' not found";
                    return rowResult;
                }

                if (evaluationImport.StartDate >= evaluationImport.EndDate)
                {
                    rowResult.Error = "Start date must be before end date";
                    return rowResult;
                }

                var evaluation = new Evaluation
                {
                    EmployeeID = employee.ID,
                    EvaluatorID = evaluator.ID,
                    Period = evaluationImport.Period,
                    StartDate = evaluationImport.StartDate,
                    EndDate = evaluationImport.EndDate,
                    Status = "Pending",
                    GeneralComments = evaluationImport.OverallComments,
                    CreatedDate = DateTime.UtcNow
                };

                _context.Evaluations.Add(evaluation);

                rowResult.Success = true;
                rowResult.Data = new { EvaluationId = evaluation.ID, EmployeeEmail = evaluationImport.EmployeeEmail };
            }
            catch (Exception ex)
            {
                rowResult.Error = ex.Message;
            }

            return rowResult;
        }

        private string GetUserId(ClaimsPrincipal user)
        {
            return user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "Unknown";
        }

        #endregion
    }
}