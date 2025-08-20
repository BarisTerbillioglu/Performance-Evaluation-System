using System.Security.Claims;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Application.DTOs.Role;
using PerformanceEvaluation.Application.DTOs.Team;
using PerformanceEvaluation.Application.DTOs.User;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Application.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IEvaluationRepository _evaluationRepository;
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IEvaluatorAssignmentRepository _evaluatorAssignmentRepository;
        private readonly ITeamRepository _teamRepository;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IEvaluationRepository evaluationRepository,
            IDepartmentRepository departmentRepository,
            IRoleRepository roleRepository,
            IUserRepository userRepository,
            IEvaluatorAssignmentRepository evaluatorAssignmentRepository,
            ITeamRepository teamRepository,
            ILogger<UserService> logger)
        {
            _departmentRepository = departmentRepository;
            _evaluationRepository = evaluationRepository;
            _roleRepository = roleRepository;
            _userRepository = userRepository;
            _evaluatorAssignmentRepository = evaluatorAssignmentRepository;
            _teamRepository = teamRepository;
            _logger = logger;
        }

        public async Task<UserDto> CreateUserAsync(CreateUserRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can create users");
            }

            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                throw new ArgumentException("User with this email already exists");
            }

            // Validate department exists
            var department = await _departmentRepository.GetByIdAsync(request.DepartmentId);
            if (department == null)
            {
                throw new ArgumentException("Department not found");
            }

            var newUser = await _userRepository.CreateUserAsync(
                request.FirstName, 
                request.LastName, 
                request.Email, 
                request.PasswordHash, 
                request.DepartmentId, 
                user);

            return MapToUserDto(newUser);
        }

        public async Task<UserDto?> UpdateUserAsync(int id, UpdateUserRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can update users");
            }

            var targetUser = await _userRepository.GetByIdAsync(id);
            if (targetUser == null)
            {
                return null;
            }

            targetUser.FirstName = request.FirstName?.Trim() ?? targetUser.FirstName;
            targetUser.LastName = request.LastName?.Trim() ?? targetUser.LastName;
            targetUser.IsActive = request.IsActive ?? targetUser.IsActive;
            targetUser.UpdatedDate = DateTime.UtcNow;

            if (request.DepartmentId.HasValue)
            {
                var department = await _departmentRepository.GetByIdAsync(request.DepartmentId.Value);
                if (department == null)
                {
                    throw new ArgumentException("Department not found");
                }
                targetUser.DepartmentID = request.DepartmentId.Value;
            }

            if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != targetUser.Email)
            {
                var existingUser = await _userRepository.GetByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    throw new ArgumentException("User with this email already exists");
                }
                targetUser.Email = request.Email.Trim();
            }

            var updatedUser = await _userRepository.UpdateAsync(targetUser);

            _logger.LogInformation("User updated: ID {UserId} by Admin {AdminId}", 
                id, GetUserId(user));

            return MapToUserDto(updatedUser);
        }

        public async Task<bool> DeleteUserAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can permanently delete users");
            }

            try
            {
                // Check for evaluations that would block permanent deletion
                var evaluations = await _evaluationRepository.GetAllAsync(user);
                var userEvaluations = evaluations.Where(e => e.EmployeeID == id).ToList();
                
                if (userEvaluations.Any())
                {
                    throw new InvalidOperationException(
                        $"Cannot permanently delete user. User has {userEvaluations.Count} evaluation(s) as employee. " +
                        "Consider using cascade deactivation instead.");
                }

                var result = await _userRepository.DeleteAsync(id);

                if (result)
                {
                    _logger.LogWarning("User permanently deleted: ID {UserId} by Admin {AdminId}", 
                        id, GetUserId(user));
                }

                return result;
            }
            catch (UnauthorizedAccessException)
            {
                throw;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error permanently deleting user {UserId}", id);
                throw new InvalidOperationException("Error occurred while permanently deleting user");
            }
        }

        public async Task<bool> DeactivateUserAsync(int id, ClaimsPrincipal user)
        {
            try
            {
                return await _userRepository.DeactivateUserAsync(id, user);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized attempt to deactivate user {UserId}: {Message}", id, ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating user {UserId}", id);
                throw new InvalidOperationException("An error occurred while deactivating the user");
            }
        }

        public async Task<bool> ReactivateUserAsync(int id, ClaimsPrincipal user)
        {
            try
            {
                return await _userRepository.ReactivateUserAsync(id, user);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized attempt to reactivate user {UserId}: {Message}", id, ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating user {UserId}", id);
                throw new InvalidOperationException("An error occurred while reactivating the user");
            }
        }

        public async Task<bool> CascadeDeactivateUserAsync(int id, ClaimsPrincipal user)
        {
            try
            {
                return await _userRepository.CascadeDeactivateUserAsync(id, user);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized attempt to cascade deactivate user {UserId}: {Message}", id, ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cascade deactivating user {UserId}", id);
                throw new InvalidOperationException("An error occurred while cascade deactivating the user");
            }
        }

        public async Task<IEnumerable<UserListDto>> GetUserListAsync(ClaimsPrincipal user)
        {
            var users = await _userRepository.GetAllAsync(user);
            return users.Select(MapToUserListDto);
        }

        public async Task<IEnumerable<UserListDto>> GetUserListInATeamAsync(int teamId, ClaimsPrincipal user)
        {
            var team = await _teamRepository.GetByIdAsync(teamId, user);
            if (team == null)
            {
                throw new ArgumentException("Team not found or not accessible");
            }

            var assignments = await _evaluatorAssignmentRepository.GetTeamAssignmentsAsync(teamId);
            var userIds = assignments.Where(a => a.IsActive)
                .SelectMany(a => new[] { a.EvaluatorID, a.EmployeeID })
                .Distinct()
                .ToList();

            var allUsers = await _userRepository.GetAllAsync(user);
            var teamUsers = allUsers.Where(u => userIds.Contains(u.ID));

            return teamUsers.Select(MapToUserListDto);
        }

        public async Task<IEnumerable<EvaluatorListDto>> GetEvaluatorListAsync(ClaimsPrincipal user)
        {
            var users = await _userRepository.GetAllAsync(user);
            var evaluators = users.Where(u => u.RoleAssignments.Any(ra => ra.RoleID == 2)); 

            return evaluators.Select(e => new EvaluatorListDto
            {
                ID = e.ID,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                TeamId = e.EvaluatorAssignments.Where(ea => ea.EvaluatorID == e.ID && ea.IsActive)
                    .Select(ea => ea.TeamID).Distinct().ToList(),
                DepartmentId = e.DepartmentID,
                IsActive = e.IsActive,
                CreatedDate = e.CreatedDate,
                UpdatedDate = e.UpdatedDate
            });
        }

        public async Task<IEnumerable<EmployeeListDto>> GetEmployeeListAsync(ClaimsPrincipal user)
        {
            var users = await _userRepository.GetAllAsync(user);
            var employees = users.Where(u => u.RoleAssignments.Any(ra => ra.RoleID == 3)); // Employee role

            return employees.Select(e => new EmployeeListDto
            {
                ID = e.ID,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                TeamId = e.EmployeeAssignments.Where(ea => ea.EmployeeID == e.ID && ea.IsActive)
                    .Select(ea => ea.TeamID).Distinct().ToList(),
                DepartmentId = e.DepartmentID,
                IsActive = e.IsActive,
                CreatedDate = e.CreatedDate,
                UpdatedDate = e.UpdatedDate
            });
        }

        public async Task<IEnumerable<EmployeeListDto>> GetEmployeeListInADepartmentAsync(int departmentId, ClaimsPrincipal user)
        {
            var users = await _userRepository.GetUsersByDepartmentAsync(departmentId, user);
            var employees = users.Where(u => u.RoleAssignments.Any(ra => ra.RoleID == 3)); // Employee role

            return employees.Select(e => new EmployeeListDto
            {
                ID = e.ID,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                TeamId = e.EmployeeAssignments.Where(ea => ea.EmployeeID == e.ID && ea.IsActive)
                    .Select(ea => ea.TeamID).Distinct().ToList(),
                DepartmentId = e.DepartmentID,
                IsActive = e.IsActive,
                CreatedDate = e.CreatedDate,
                UpdatedDate = e.UpdatedDate
            });
        }

        public async Task<UserWithDetailsDto?> GetUserDetailsAsync(int id, ClaimsPrincipal user)
        {
            var targetUser = await _userRepository.GetByIdAsync(id, user);
            if (targetUser == null)
            {
                return null;
            }

            var evaluatorAssignments = await _evaluatorAssignmentRepository.GetEvaluatorAssignmentsAsync(id);
            var employeeAssignments = await _evaluatorAssignmentRepository.GetEmployeeAssignmentsAsync(id);

            return new UserWithDetailsDto
            {
                Id = targetUser.ID,
                FirstName = targetUser.FirstName,
                LastName = targetUser.LastName,
                Email = targetUser.Email,
                DepartmentId = targetUser.DepartmentID,
                DepartmentName = targetUser.Department?.Name ?? "",
                IsActive = targetUser.IsActive,
                CreatedDate = targetUser.CreatedDate,
                UpdatedDate = targetUser.UpdatedDate,
                Roles = targetUser.RoleAssignments.Select(ra => new RoleAssignmentSummaryDto
                {
                    RoleId = ra.RoleID,
                    RoleName = ra.Role.Name,
                    AssignedDate = ra.AssignedDate
                }).ToList(),
                EvaluatorTeams = evaluatorAssignments.Where(ea => ea.IsActive)
                    .GroupBy(ea => ea.Team)
                    .Select(g => new TeamSummaryDto
                    {
                        Id = g.Key.ID,
                        Name = g.Key.Name,
                        Description = g.Key.Description
                    }).ToList(),
                EmployeeTeams = employeeAssignments.Where(ea => ea.IsActive)
                    .GroupBy(ea => ea.Team)
                    .Select(g => new TeamSummaryDto
                    {
                        Id = g.Key.ID,
                        Name = g.Key.Name,
                        Description = g.Key.Description
                    }).ToList()
            };
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request, ClaimsPrincipal user)
        {
            var requestingUserId = GetUserId(user);
            
            // Users can change their own password, admins can change any password
            if (!user.IsInRole("Admin") && requestingUserId != userId)
            {
                throw new UnauthorizedAccessException("You can only change your own password");
            }

            var targetUser = await _userRepository.GetByIdAsync(userId);
            if (targetUser == null)
            {
                return false;
            }

            // If not admin, verify current password
            if (!user.IsInRole("Admin"))
            {
                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, targetUser.PasswordHash))
                {
                    throw new ArgumentException("Current password is incorrect");
                }
            }

            targetUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            targetUser.UpdatedDate = DateTime.UtcNow;

            await _userRepository.UpdateAsync(targetUser);

            _logger.LogInformation("Password changed for user: ID {UserId} by User {RequestingUserId}", 
                userId, requestingUserId);

            return true;
        }

        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                ID = user.ID,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PasswordHash = user.PasswordHash,
                DepartmentId = user.DepartmentID,
                IsActive = user.IsActive,
                CreatedDate = user.CreatedDate,
                UpdatedDate = user.UpdatedDate
            };
        }

        private UserListDto MapToUserListDto(User user)
        {
            return new UserListDto
            {
                ID = user.ID,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                TeamId = user.EvaluatorAssignments.Where(ea => ea.EvaluatorID == user.ID && ea.IsActive)
                    .Select(ea => ea.TeamID).Distinct().ToList(),
                RoleId = user.RoleAssignments.Where(ra => ra.RoleID > 3) // Job roles only
                    .Select(ra => ra.RoleID).ToList(),
                DepartmentId = user.DepartmentID,
                IsActive = user.IsActive,
                CreatedDate = user.CreatedDate,
                UpdatedDate = user.UpdatedDate
            };
        }

        private int GetUserId(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }
    }
}