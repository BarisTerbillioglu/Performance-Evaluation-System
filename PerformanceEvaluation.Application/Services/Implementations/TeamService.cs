using System.Security.Claims;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Application.DTOs.Team;
using PerformanceEvaluation.Application.DTOs.User;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Application.Services.Implementations
{
    public class TeamService : ITeamService
    {
        private readonly ITeamRepository _teamRepository;
        private readonly IUserRepository _userRepository;
        private readonly IEvaluatorAssignmentRepository _evaluatorAssignmentRepository;
        private readonly ILogger<TeamService> _logger;

        public TeamService(
            ITeamRepository teamRepository,
            IUserRepository userRepository,
            IEvaluatorAssignmentRepository evaluatorAssignmentRepository,
            ILogger<TeamService> logger)
        {
            _teamRepository = teamRepository;
            _userRepository = userRepository;
            _evaluatorAssignmentRepository = evaluatorAssignmentRepository;
            _logger = logger;
        }

        public async Task<TeamDto> CreateTeamAsync(CreateTeamRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can create teams");
            }

            var team = new Team
            {
                Name = request.Name.Trim(),
                Description = request.Description?.Trim() ?? "",
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            var createdTeam = await _teamRepository.AddAsync(team);

            _logger.LogInformation("Team created: ID {TeamId} by User {UserId}", 
                createdTeam.ID, GetUserId(user));

            return MapToDto(createdTeam);
        }

        public async Task<TeamDto?> UpdateTeamAsync(int id, UpdateTeamRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can update teams");
            }

            var team = await _teamRepository.GetByIdAsync(id);
            if (team == null)
            {
                return null;
            }

            team.Name = request.Name?.Trim() ?? team.Name;
            team.Description = request.Description?.Trim() ?? team.Description;
            team.IsActive = request.IsActive ?? team.IsActive;

            var updatedTeam = await _teamRepository.UpdateAsync(team);

            _logger.LogInformation("Team updated: ID {TeamId} by User {UserId}", 
                id, GetUserId(user));

            return MapToDto(updatedTeam);
        }

        public async Task<bool> DeactivateTeamAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can deactivate teams");
            }

            var result = await _teamRepository.DeactivateAsync(id);

            if (result)
            {
                _logger.LogInformation("Team deactivated: ID {TeamId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<bool> ReactivateTeamAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can reactivate teams");
            }

            var result = await _teamRepository.ReactivateAsync(id);

            if (result)
            {
                _logger.LogInformation("Team reactivated: ID {TeamId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<bool> CascadeDeactivateTeamAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can cascade deactivate teams");
            }

            var team = await _teamRepository.GetByIdAsync(id);
            if (team == null)
            {
                return false;
            }

            using var transaction = await _teamRepository.BeginTransactionAsync();
            
            try
            {
                // Deactivate all team assignments first
                var assignments = await _evaluatorAssignmentRepository.GetTeamAssignmentsAsync(id);
                foreach (var assignment in assignments.Where(a => a.IsActive))
                {
                    await _evaluatorAssignmentRepository.DeactivateAssignmentAsync(assignment.ID);
                }

                // Then deactivate the team
                await _teamRepository.DeactivateAsync(id);

                await transaction.CommitAsync();

                _logger.LogInformation("Team and assignments cascade deactivated: ID {TeamId} by Admin {UserId}", 
                    id, GetUserId(user));

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error during cascade deactivation for team {TeamId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteTeamAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can permanently delete teams");
            }

            // For permanent deletion, check ALL assignments (active and inactive)
            var assignments = await _evaluatorAssignmentRepository.GetTeamAssignmentsAsync(id);
            if (assignments.Any()) // ANY assignments, not just active ones
            {
                throw new InvalidOperationException(
                    $"Cannot permanently delete team. Team has {assignments.Count()} assignment(s) (active and inactive). " +
                    "Consider using cascade deactivation instead.");
            }

            var result = await _teamRepository.DeleteAsync(id);

            if (result)
            {
                _logger.LogWarning("Team permanently deleted: ID {TeamId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<IEnumerable<TeamDto>> GetAllTeamsAsync(ClaimsPrincipal user)
        {
            var teams = await _teamRepository.GetAllAsync(user);
            return teams.Select(MapToDto);
        }

        public async Task<TeamDto?> GetTeamByIdAsync(int id, ClaimsPrincipal user)
        {
            var team = await _teamRepository.GetByIdAsync(id, user);
            return team != null ? MapToDto(team) : null;
        }

        public async Task<TeamWithMembersDto?> GetTeamWithMembersAsync(int id, ClaimsPrincipal user)
        {
            var team = await _teamRepository.GetByIdAsync(id, user);
            if (team == null)
            {
                return null;
            }

            var assignments = await _evaluatorAssignmentRepository.GetTeamAssignmentsAsync(id);
            var activeAssignments = assignments.Where(a => a.IsActive).ToList();

            var evaluators = activeAssignments
                .GroupBy(a => a.EvaluatorID)
                .Select(g => g.First().Evaluator)
                .ToList();

            var employees = activeAssignments
                .GroupBy(a => a.EmployeeID)
                .Select(g => g.First().Employee)
                .ToList();

            return new TeamWithMembersDto
            {
                Id = team.ID,
                Name = team.Name,
                Description = team.Description,
                IsActive = team.IsActive,
                CreatedDate = team.CreatedDate,
                Evaluators = evaluators.Select(e => new UserSummaryDto
                {
                    Id = e.ID,
                    FirstName = e.FirstName,
                    LastName = e.LastName,
                    Email = e.Email,
                    IsActive = e.IsActive
                }).ToList(),
                Employees = employees.Select(e => new UserSummaryDto
                {
                    Id = e.ID,
                    FirstName = e.FirstName,
                    LastName = e.LastName,
                    Email = e.Email,
                    IsActive = e.IsActive
                }).ToList()
            };
        }

        public async Task<TeamAssignmentDto> AssignEvaluatorToTeamAsync(AssignEvaluatorRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can assign evaluators to teams");
            }

            var team = await _teamRepository.GetByIdAsync(request.TeamId);
            if (team == null)
            {
                throw new ArgumentException("Team not found");
            }

            var evaluator = await _userRepository.GetByIdWithRolesAsync(request.EvaluatorId);
            if (evaluator == null)
            {
                throw new ArgumentException("Evaluator not found");
            }

            // Check if evaluator has the Evaluator role
            var evaluatorRole = evaluator.RoleAssignments.Any(ra => ra.RoleID == 2 && ra.IsActive); 
            if (!evaluatorRole)
            {
                throw new ArgumentException("User must have Evaluator role");
            }

            // Check if assignment already exists
            var existingAssignment = await _evaluatorAssignmentRepository
                .GetEvaluatorTeamAssignmentAsync(request.EvaluatorId, request.TeamId);

            if (existingAssignment != null && existingAssignment.IsActive)
            {
                throw new InvalidOperationException("Evaluator is already assigned to this team");
            }

            else if (existingAssignment != null && !existingAssignment.IsActive)
            {
                var reactivate = await _evaluatorAssignmentRepository.ReactivateAssignmentAsync(existingAssignment.ID);

                return new TeamAssignmentDto
            {
                Id = existingAssignment.ID,
                TeamId = existingAssignment.TeamID,
                EvaluatorId = existingAssignment.EvaluatorID,
                EmployeeId = existingAssignment.EmployeeID,
                AssignedDate = existingAssignment.AssignedDate,
                IsActive = existingAssignment.IsActive
            };
            }
        
            var assignment = new EvaluatorAssignment
            {
                EvaluatorID = request.EvaluatorId,
                EmployeeID = request.EvaluatorId, // In team context, evaluator can also be an employee
                TeamID = request.TeamId,
                IsActive = true,
                AssignedDate = DateTime.UtcNow
            };

            var createdAssignment = await _evaluatorAssignmentRepository.AddAsync(assignment);

            _logger.LogInformation("Evaluator assigned to team: EvaluatorId {EvaluatorId}, TeamId {TeamId} by Admin {AdminId}", 
                request.EvaluatorId, request.TeamId, GetUserId(user));

            return new TeamAssignmentDto
            {
                Id = createdAssignment.ID,
                TeamId = createdAssignment.TeamID,
                EvaluatorId = createdAssignment.EvaluatorID,
                EmployeeId = createdAssignment.EmployeeID,
                AssignedDate = createdAssignment.AssignedDate,
                IsActive = createdAssignment.IsActive
            };
        }

        public async Task<TeamAssignmentDto> AssignEmployeeToTeamAsync(AssignEmployeeRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can assign employees to teams");
            }

            var team = await _teamRepository.GetByIdAsync(request.TeamId);
            if (team == null)
            {
                throw new ArgumentException("Team not found");
            }

            var employee = await _userRepository.GetByIdAsync(request.EmployeeId);
            if (employee == null)
            {
                throw new ArgumentException("Employee not found");
            }

            var evaluator = await _userRepository.GetByIdAsync(request.EvaluatorId);
            if (evaluator == null)
            {
                throw new ArgumentException("Evaluator not found");
            }

            // Verify evaluator is assigned to the team
            var evaluatorTeamAssignment = await _evaluatorAssignmentRepository
                .GetEvaluatorTeamAssignmentAsync(request.EvaluatorId, request.TeamId);
            
            if (evaluatorTeamAssignment == null || !evaluatorTeamAssignment.IsActive)
            {
                throw new ArgumentException("Evaluator is not assigned to this team");
            }

            var assignment = new EvaluatorAssignment
            {
                EvaluatorID = request.EvaluatorId,
                EmployeeID = request.EmployeeId,
                TeamID = request.TeamId,
                IsActive = true,
                AssignedDate = DateTime.UtcNow
            };

            var createdAssignment = await _evaluatorAssignmentRepository.AddAsync(assignment);

            _logger.LogInformation("Employee assigned to team: EmployeeId {EmployeeId}, EvaluatorId {EvaluatorId}, TeamId {TeamId} by Admin {AdminId}", 
                request.EmployeeId, request.EvaluatorId, request.TeamId, GetUserId(user));

            return new TeamAssignmentDto
            {
                Id = createdAssignment.ID,
                TeamId = createdAssignment.TeamID,
                EvaluatorId = createdAssignment.EvaluatorID,
                EmployeeId = createdAssignment.EmployeeID,
                AssignedDate = createdAssignment.AssignedDate,
                IsActive = createdAssignment.IsActive
            };
        }

        public async Task<bool> RemoveUserFromTeamAsync(int teamId, int userId, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can remove users from teams");
            }

            var result = await _evaluatorAssignmentRepository.DeactivateTeamAssignmentAsync(teamId, userId);

            if (result)
            {
                _logger.LogInformation("User removed from team: UserId {UserId}, TeamId {TeamId} by Admin {AdminId}", 
                    userId, teamId, GetUserId(user));
            }

            return result;
        }

        public async Task<IEnumerable<TeamAssignmentDto>> GetTeamAssignmentsAsync(int teamId, ClaimsPrincipal user)
        {
            var team = await _teamRepository.GetByIdAsync(teamId, user);
            if (team == null)
            {
                throw new ArgumentException("Team not found or not accessible");
            }

            var assignments = await _evaluatorAssignmentRepository.GetTeamAssignmentsAsync(teamId);
            
            return assignments.Select(a => new TeamAssignmentDto
            {
                Id = a.ID,
                TeamId = a.TeamID,
                EvaluatorId = a.EvaluatorID,
                EmployeeId = a.EmployeeID,
                AssignedDate = a.AssignedDate,
                IsActive = a.IsActive
            });
        }

        private TeamDto MapToDto(Team team)
        {
            return new TeamDto
            {
                Id = team.ID,
                Name = team.Name,
                Description = team.Description,
                IsActive = team.IsActive,
                CreatedDate = team.CreatedDate
            };
        }

        private int GetUserId(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }
    }
}