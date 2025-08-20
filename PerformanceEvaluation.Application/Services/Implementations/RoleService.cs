using System.Security.Claims;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Application.DTOs.Role;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Application.Services.Implementations
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<RoleService> _logger;

        public RoleService(
            IRoleRepository roleRepository,
            IUserRepository userRepository,
            ILogger<RoleService> logger)
        {
            _roleRepository = roleRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<RoleDto> CreateRoleAsync(CreateRoleRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can create roles");
            }

            var existingRole = await _roleRepository.GetRoleByNameAsync(request.Name);
            if (existingRole != null)
            {
                throw new ArgumentException("Role with this name already exists");
            }

            var role = new Role
            {
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                IsActive = true
            };

            var createdRole = await _roleRepository.AddAsync(role);

            _logger.LogInformation("Role created: ID {RoleId} by User {UserId}", 
                createdRole.ID, GetUserId(user));

            return MapToDto(createdRole);
        }

        public async Task<RoleDto?> UpdateRoleAsync(int id, UpdateRoleRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can update roles");
            }

            var role = await _roleRepository.GetByIdAsync(id);
            if (role == null)
            {
                return null;
            }

            // Prevent modification of system roles (IDs 1-3)
            if (id <= 3)
            {
                throw new InvalidOperationException("System roles cannot be modified");
            }

            if (!string.IsNullOrWhiteSpace(request.Name) && request.Name != role.Name)
            {
                var existingRole = await _roleRepository.GetRoleByNameAsync(request.Name);
                if (existingRole != null)
                {
                    throw new ArgumentException("Role with this name already exists");
                }
                role.Name = request.Name.Trim();
            }

            role.Description = request.Description?.Trim() ?? role.Description;
            role.IsActive = request.IsActive ?? role.IsActive;

            var updatedRole = await _roleRepository.UpdateAsync(role);

            _logger.LogInformation("Role updated: ID {RoleId} by User {UserId}", 
                id, GetUserId(user));

            return MapToDto(updatedRole);
        }

        public async Task<bool> DeactivateRoleAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can deactivate roles");
            }

            var role = await _roleRepository.GetByIdAsync(id);
            if (role == null)
            {
                return false;
            }

            // Prevent deactivation of system roles (ID <= 3)
            if (role.ID <= 3)
            {
                throw new InvalidOperationException("Cannot deactivate system roles (Admin, Evaluator, Employee)");
            }

            var result = await _roleRepository.DeactivateAsync(id);

            if (result)
            {
                _logger.LogInformation("Role deactivated: ID {RoleId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<bool> ReactivateRoleAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can reactivate roles");
            }

            var result = await _roleRepository.ReactivateAsync(id);

            if (result)
            {
                _logger.LogInformation("Role reactivated: ID {RoleId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<bool> CascadeDeactivateRoleAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can cascade deactivate roles");
            }

            var role = await _roleRepository.GetByIdAsync(id);
            if (role == null)
            {
                return false;
            }

            // Prevent deactivation of system roles
            if (role.ID <= 3)
            {
                throw new InvalidOperationException("Cannot deactivate system roles (Admin, Evaluator, Employee)");
            }

            // Check for active role assignments
            var assignments = await _roleRepository.GetRoleAssignmentsAsync(id);
            var activeAssignments = assignments.Where(ra => ra.IsActive).ToList();
            
            if (activeAssignments.Any())
            {
                throw new InvalidOperationException(
                    $"Cannot deactivate role. Role has {activeAssignments.Count} active assignment(s). " +
                    "Please remove role assignments first.");
            }

            var result = await _roleRepository.DeactivateAsync(id);

            if (result)
            {
                _logger.LogInformation("Role cascade deactivated: ID {RoleId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<bool> DeleteRoleAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can permanently delete roles");
            }

            var role = await _roleRepository.GetByIdAsync(id);
            if (role == null)
            {
                return false;
            }

            // Prevent deletion of system roles
            if (role.ID <= 3)
            {
                throw new InvalidOperationException("Cannot delete system roles (Admin, Evaluator, Employee)");
            }

            // Check for ANY role assignments (active or inactive)
            var assignments = await _roleRepository.GetRoleAssignmentsAsync(id);
            if (assignments.Any())
            {
                throw new InvalidOperationException(
                    $"Cannot permanently delete role. Role has {assignments.Count()} assignment(s). " +
                    "Consider using deactivation instead.");
            }

            var result = await _roleRepository.DeleteAsync(id);

            if (result)
            {
                _logger.LogWarning("Role permanently deleted: ID {RoleId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<IEnumerable<RoleDto>> GetAllRolesAsync(ClaimsPrincipal user)
        {
            var roles = await _roleRepository.GetAllAsync();
            
            // Non-admin users only see active roles
            if (!user.IsInRole("Admin"))
            {
                roles = roles.Where(r => r.IsActive);
            }

            return roles.Select(MapToDto);
        }

        public async Task<RoleDto?> GetRoleByIdAsync(int id, ClaimsPrincipal user)
        {
            var role = await _roleRepository.GetByIdAsync(id);
            
            if (role == null || (!user.IsInRole("Admin") && !role.IsActive))
            {
                return null;
            }

            return MapToDto(role);
        }

        public async Task<RoleDto?> GetRoleByNameAsync(string name, ClaimsPrincipal user)
        {
            var role = await _roleRepository.GetRoleByNameAsync(name);
            
            if (role == null || (!user.IsInRole("Admin") && !role.IsActive))
            {
                return null;
            }

            return MapToDto(role);
        }

        public async Task<IEnumerable<RoleDto>> GetSystemRolesAsync(ClaimsPrincipal user)
        {
            var roles = await _roleRepository.GetSystemRolesAsync();
            return roles.Select(MapToDto);
        }

        public async Task<IEnumerable<RoleDto>> GetJobRolesAsync(ClaimsPrincipal user)
        {
            var roles = await _roleRepository.GetJobRolesAsync();
            return roles.Select(MapToDto);
        }

        public async Task<RoleAssignmentDto> AssignRoleToUserAsync(AssignRoleRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can assign roles");
            }

            var targetUser = await _userRepository.GetByIdAsync(request.UserId);
            if (targetUser == null)
            {
                throw new ArgumentException("User not found");
            }

            var role = await _roleRepository.GetByIdAsync(request.RoleId);
            if (role == null)
            {
                throw new ArgumentException("Role not found");
            }

            // Check if user already has this role
            var existingAssignment = await _roleRepository.GetUserRoleAssignmentAsync(request.UserId, request.RoleId);
            if (existingAssignment != null)
            {
                throw new InvalidOperationException("User already has this role assigned");
            }

            var roleAssignment = new RoleAssignment
            {
                UserID = request.UserId,
                RoleID = request.RoleId,
                AssignedDate = DateTime.UtcNow
            };

            var createdAssignment = await _roleRepository.AddRoleAssignmentAsync(roleAssignment);
            targetUser = await _userRepository.UpdateAsync(targetUser);

            _logger.LogInformation("Role assigned: UserId {UserId}, RoleId {RoleId} by Admin {AdminId}", 
                request.UserId, request.RoleId, GetUserId(user));

            return new RoleAssignmentDto
            {
                Id = createdAssignment.ID,
                UserId = createdAssignment.UserID,
                RoleId = createdAssignment.RoleID,
                AssignedDate = createdAssignment.AssignedDate,
                RoleName = role.Name,
                UserName = $"{targetUser.FirstName} {targetUser.LastName}"
            };
        }

        public async Task<bool> RemoveRoleFromUserAsync(int userId, int roleId, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can remove role assignments");
            }

            var result = await _roleRepository.RemoveRoleAssignmentAsync(userId, roleId);

            if (result)
            {
                _logger.LogInformation("Role removed: UserId {UserId}, RoleId {RoleId} by Admin {AdminId}", 
                    userId, roleId, GetUserId(user));
            }

            return result;
        }

        public async Task<IEnumerable<RoleAssignmentDto>> GetUserRolesAsync(int userId, ClaimsPrincipal user)
        {
            var targetUser = await _userRepository.GetByIdAsync(userId, user);
            if (targetUser == null)
            {
                throw new ArgumentException("User not found or not accessible");
            }

            var assignments = await _roleRepository.GetUserRoleAssignmentsAsync(userId);
            
            return assignments.Select(ra => new RoleAssignmentDto
            {
                Id = ra.ID,
                UserId = ra.UserID,
                RoleId = ra.RoleID,
                AssignedDate = ra.AssignedDate,
                RoleName = ra.Role.Name,
                UserName = $"{ra.User.FirstName} {ra.User.LastName}"
            });
        }

        private RoleDto MapToDto(Role role)
        {
            return new RoleDto
            {
                Id = role.ID,
                Name = role.Name,
                Description = role.Description,
                IsActive = role.IsActive,
                IsSystemRole = role.ID <= 3,
                IsJobRole = role.ID > 3
            };
        }

        private int GetUserId(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }
    }
}