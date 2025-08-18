using System.Security.Claims;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Application.DTOs.Department;
using PerformanceEvaluation.Application.DTOs.User;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Application.Services.Implementations
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<DepartmentService> _logger;

        public DepartmentService(
            IDepartmentRepository departmentRepository,
            IUserRepository userRepository,
            ILogger<DepartmentService> logger)
        {
            _departmentRepository = departmentRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can create departments");
            }

            var department = new Department
            {
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            var createdDepartment = await _departmentRepository.AddAsync(department);

            _logger.LogInformation("Department created: ID {DepartmentId} by User {UserId}", 
                createdDepartment.ID, GetUserId(user));

            return MapToDto(createdDepartment);
        }

        public async Task<DepartmentDto?> UpdateDepartmentAsync(int id, UpdateDepartmentRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can update departments");
            }

            var department = await _departmentRepository.GetByIdAsync(id);
            if (department == null)
            {
                return null;
            }

            department.Name = request.Name?.Trim() ?? department.Name;
            department.Description = request.Description?.Trim() ?? department.Description;
            department.IsActive = request.IsActive ?? department.IsActive;

            var updatedDepartment = await _departmentRepository.UpdateAsync(department);

            _logger.LogInformation("Department updated: ID {DepartmentId} by User {UserId}", 
                id, GetUserId(user));

            return MapToDto(updatedDepartment);
        }

        public async Task<bool> DeleteDepartmentAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can delete departments");
            }

            // Check if department has users
            var users = await _userRepository.GetUsersByDepartmentAsync(id, user);
            if (users.Any())
            {
                throw new InvalidOperationException("Cannot delete department with existing users");
            }

            var result = await _departmentRepository.DeleteAsync(id);

            if (result)
            {
                _logger.LogInformation("Department deleted: ID {DepartmentId} by User {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync(ClaimsPrincipal user)
        {
            var departments = await _departmentRepository.GetAllAsync(user);
            return departments.Select(MapToDto);
        }

        public async Task<DepartmentDto?> GetDepartmentByIdAsync(int id, ClaimsPrincipal user)
        {
            var department = await _departmentRepository.GetByIdAsync(id, user);
            return department != null ? MapToDto(department) : null;
        }

        public async Task<DepartmentWithUsersDto?> GetDepartmentWithUsersAsync(int id, ClaimsPrincipal user)
        {
            var department = await _departmentRepository.GetByIdAsync(id, user);
            if (department == null)
            {
                return null;
            }

            var users = await _departmentRepository.GetDepartmentUsersAsync(id, user);

            return new DepartmentWithUsersDto
            {
                Id = department.ID,
                Name = department.Name,
                Description = department.Description,
                IsActive = department.IsActive,
                CreatedDate = department.CreatedDate,
                Users = users.Select(u => new UserSummaryDto
                {
                    Id = u.ID,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    IsActive = u.IsActive
                }).ToList()
            };
        }

        public async Task<DepartmentDto?> GetMyDepartmentAsync(ClaimsPrincipal user)
        {
            var userId = GetUserId(user);
            var department = await _departmentRepository.GetMyDepartmentAsync(userId);
            return department != null ? MapToDto(department) : null;
        }

        public async Task<DepartmentStatsDto> GetDepartmentStatsAsync(int id, ClaimsPrincipal user)
        {
            var department = await _departmentRepository.GetByIdAsync(id, user);
            if (department == null)
            {
                throw new ArgumentException("Department not found");
            }

            var users = await _departmentRepository.GetDepartmentUsersAsync(id, user);
            var activeUsers = users.Where(u => u.IsActive).ToList();

            return new DepartmentStatsDto
            {
                DepartmentId = id,
                DepartmentName = department.Name,
                TotalUsers = users.Count(),
                ActiveUsers = activeUsers.Count,
                InactiveUsers = users.Count() - activeUsers.Count,
                Evaluators = activeUsers.Count(u => u.RoleAssignments.Any(ra => ra.RoleID == 2)), // Evaluator role
                Employees = activeUsers.Count(u => u.RoleAssignments.Any(ra => ra.RoleID == 3))  // Employee role
            };
        }

        private DepartmentDto MapToDto(Department department)
        {
            return new DepartmentDto
            {
                Id = department.ID,
                Name = department.Name,
                Description = department.Description,
                IsActive = department.IsActive,
                CreatedDate = department.CreatedDate
            };
        }

        private int GetUserId(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }
    }
}