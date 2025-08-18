using System.Security.Claims;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Application.DTOs.Evaluation;
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
        private readonly ILogger<UserService> _logger;

        public UserService(
            IEvaluationRepository evaluationRepository,
            IDepartmentRepository departmentRepository,
            IRoleRepository roleRepository,
            IUserRepository userRepository,
            ILogger<UserService> logger)
        {
            _departmentRepository = departmentRepository;
            _evaluationRepository = evaluationRepository;
            _roleRepository = roleRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<UserDto> CreateUserAsync(CreateUserRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only evaluators and admins can create evaluations");
            }

            var createdUser = await _userRepository.GetByEmailAsync(request.Email);
            if (createdUser != null)
            {
                throw new ArgumentException("User already exists!");
            }
            var newUser = await _userRepository.CreateUserAsync(request.FirstName, request.LastName, request.Email, request.PasswordHash, request.DepartmentId, user);

            return new UserDto
            {
                ID = newUser.ID,
                FirstName = newUser.FirstName,
                LastName = newUser.LastName,
                Email = newUser.Email,
                PasswordHash = newUser.PasswordHash,
                DepartmentId = newUser.DepartmentID,
                IsActive = newUser.IsActive,
                CreatedDate = newUser.CreatedDate,
                UpdatedDate = newUser.UpdatedDate
            };
        }

        public async Task<bool> DeleteUserAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can delete evaluations");
            }

            var deletedUser = await _userRepository.GetByIdAsync(id);

            if (deletedUser == null)
            {
                return false;
            }

            var result = await _userRepository.DeleteAsync(id);

            if (result)
            {
                _logger.LogInformation("User deleted: ID {userId} by User {UserId}",
                    id, GetUserId(user));
            }

            return result; 
        }

        public async Task<IEnumerable<EmployeeListDto>> GetEmployeeListAsync(ClaimsPrincipal user)
        {
            var users = await _userRepository.GetAllAsync(user);

            return users.Select(e => new EmployeeListDto
            {
                ID = e.ID,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                TeamId = e.EvaluatorAssignments.Where(ea => ea.EmployeeID == e.ID).Select(t => t.ID).ToList(),
                DepartmentId = e.DepartmentID,
                IsActive = e.IsActive,
                CreatedDate = e.CreatedDate
            });
        }

        public async Task<IEnumerable<EmployeeListDto>> GetEmployeeListInADepartmentAsync(ClaimsPrincipal user, int id)
        {
            var users = await _userRepository.GetAllAsync(user);

            return users.Select(e => new EmployeeListDto
            {
                ID = e.ID,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                TeamId = e.EvaluatorAssignments.Where(ea => ea.EmployeeID == e.ID).Select(t => t.ID).ToList(),
                DepartmentId = e.DepartmentID,
                IsActive = e.IsActive,
                CreatedDate = e.CreatedDate
            }).Where(e => e.DepartmentId == id);
        }

        public async Task<IEnumerable<EvaluatorListDto>> GetEvaluatorListAsync(ClaimsPrincipal user)
        {
            var users = await _userRepository.GetAllAsync(user);

            return users.Select(e => new EvaluatorListDto
            {
                ID = e.ID,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                TeamId = e.EvaluatorAssignments.Where(ea => ea.EvaluatorID == e.ID).Select(t => t.ID).ToList(),
                DepartmentId = e.DepartmentID,
                IsActive = e.IsActive,
                CreatedDate = e.CreatedDate
            });
        }

        public Task<IEnumerable<EvaluationDto>> GetUserEvaluationsAsync(ClaimsPrincipal user, int id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<UserListDto>> GetUserListAsync(ClaimsPrincipal user)
        {
            var users = await _userRepository.GetAllAsync(user);

            return users.Select(e => new UserListDto
            {
                ID = e.ID,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                TeamId = e.EvaluatorAssignments.Where(ea => ea.EvaluatorID == e.ID).Select(t => t.ID).ToList(),
                RoleId = e.RoleAssignments.Where(ra => ra.UserID == e.ID && ra.RoleID > 3).Select(ra => ra.RoleID).ToList(),
                DepartmentId = e.DepartmentID,
                IsActive = e.IsActive,
                CreatedDate = e.CreatedDate
            });
        }

        public Task<IEnumerable<UserListDto>> GetUserListInATeamAsync(ClaimsPrincipal user)
        {
            throw new NotImplementedException();
        }

        public Task<SystemRoleDto> UpdateSystemRoleAsync(UpdateSystemRoleRequest request, ClaimsPrincipal user)
        {
            throw new NotImplementedException();
        }

        public Task<JobRoleDto> UpdateSystemRoleAsync(UpdateJobRoleRequest request, ClaimsPrincipal user)
        {
            throw new NotImplementedException();
        }

        public Task<UserDto> UpdateUserAsync(ClaimsPrincipal user, int id)
        {
            throw new NotImplementedException();
        }

        public Task<TeamDto> UpdateUserTeamAsync(UpdateUserTeamRequest request, ClaimsPrincipal user)
        {
            throw new NotImplementedException();
        }
        private int GetUserId(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }
    }
}