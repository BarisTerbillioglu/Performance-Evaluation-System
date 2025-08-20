using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Data;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Implementation
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context, ILogger<UserRepository> logger)
    : base(context, logger) { }

        public async Task<User> CreateUserAsync(string firstName, string lastName, string email, string passwordHash, int departmentId, ClaimsPrincipal user)
        {
            try
            {
                var RequestingUserId = GetUserId(user);

                if (!IsAdmin(user))
                {
                    _logger.LogWarning("User {requestingUserId} attempted to create new User without permission",
                        RequestingUserId);
                    throw new UnauthorizedAccessException("Cannot evaluate this employee");
                }

                var newUser = new User
                {
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                    PasswordHash = passwordHash,
                    DepartmentID = departmentId,
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow
                };

                await _dbSet.AddAsync(newUser);
                await _context.SaveChangesAsync();

                _logger.LogInformation("New user is created: ID {NewUserId} by User {UserId}",
                    newUser.ID, RequestingUserId);

                return newUser;
            }
            catch (UnauthorizedAccessException)
            {
                // Re-throw authorization errors
                throw;
            }
            catch (Exception ex)
            {
                var requestingUserId = GetUserId(user);
                _logger.LogError(ex, "Error creating new user. User attempting to create a new user: {requestingUserId}",
                    requestingUserId);
                throw;
            }
        }

        /// <summary>
        /// Checks if the requesting user can access data of the target user
        /// </summary>
        /// <param name="id">ID of the TARGET USER whose data is being requested</param>
        /// <param name="user">REQUESTING USER (ClaimsPrincipal) who wants to access the data</param>
        /// <returns>Boolean indicating if requesting user can access target user's data</returns>
        public async Task<bool> CanAccessAsync(int id, ClaimsPrincipal user)
        {
            try
            {
                var requestingUserId = GetUserId(user);
                if (IsAdmin(user))
                {
                    _logger.LogInformation("Admin user {RequestingUserId} is granted access to user data {TargetUserId}",
                        requestingUserId, id);
                    return true;
                }
                if (IsEvaluator(user))
                {
                    var evaluatorId = GetUserId(user);
                    var canAccess = await IsMyTeamMemberAsync(evaluatorId, id);
                    if (canAccess)
                    {
                        _logger.LogInformation("Evaluator {EvaluatorId} granted access to team member {EmployeeId}",
                            evaluatorId, id);
                    }
                    else
                    {
                        _logger.LogWarning("Evaluator {EvaluatorId} denied access to non-team member {EmployeeId}",
                            evaluatorId, id);
                    }
                    return canAccess;
                }
                if (IsEmployee(user))
                {
                    var employeeId = GetUserId(user);
                    var canAccess = employeeId == id; // Employee can only access their own data

                    if (canAccess)
                    {
                        _logger.LogInformation("Employee {EmployeeId} is granted access to own data", employeeId);
                    }
                    else
                    {
                        _logger.LogWarning("Employee {EmployeeId} is denied access to other user's data {TargetUserId}",
                            employeeId, id);
                    }

                    return canAccess;
                }
                _logger.LogWarning("User {RequestingUserId} with unrecognized role is denied access to user data {TargetUserId}",
                    requestingUserId, id);
                return false;
            }
            catch (Exception ex)
            {
                var requestingUserId = GetUserId(user);
                _logger.LogError(ex, "Error checking data access authorization. Requesting user: {RequestingUserId}, Target user: {TargetUserId}",
                    requestingUserId, id);
                return false;
            }
        }

        public async Task<IEnumerable<User>> GetAllAsync(ClaimsPrincipal user)
        {
            //Logs will be added later.
            try
            {
                if (IsAdmin(user))
                {
                    return await GetAllUsersAsync();
                }
                if (IsEvaluator(user))
                {
                    var evaluatorId = GetUserId(user);
                    return await GetMyTeamMembersAsync(evaluatorId);
                }
                if (IsEmployee(user))
                {
                    var userId = GetUserId(user);
                    var myProfile = await GetMyProfileAsync(userId);
                    return myProfile != null ? new[] { myProfile } : new List<User>();
                }
                return new List<User>();
            }
            catch (Exception ex)
            {
                var requestingUserId = GetUserId(user);
                _logger.LogError(ex, "Error getting data for user: {RequestingUserId}",
                    requestingUserId);
                return new List<User>();
            }
        }
        //Admin only method
        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            try
            {
                return await _dbSet
                    .Include(u => u.RoleAssignments)
                        .ThenInclude(ra => ra.Role)
                    .Include(u => u.Department)
                    .Where(u => u.IsActive)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all user's data.");
                return new List<User>();
            }
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            try
            {
                return await _dbSet
                    .Include(u => u.RoleAssignments)
                        .ThenInclude(ra => ra.Role)
                    .Include(u => u.Department)
                    .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting getting user data by email");
                return null;
            }
        }

        public async Task<User?> GetByIdAsync(int id, ClaimsPrincipal user)
        {
            try
            {
                if (IsAdmin(user))
                {
                    return await GetByIdAsync(id);
                }
                if (IsEvaluator(user))
                {
                    var evaluatorID = GetUserId(user);
                    var canAccess = await IsMyTeamMemberAsync(evaluatorID, id);
                    return canAccess ? await GetByIdAsync(id) : null;
                }
                if (IsEmployee(user))
                {
                    var userID = GetUserId(user);
                    return userID == id ? await GetMyProfileAsync(userID) : null;
                }
                return null;
            }
            catch (Exception ex)
            {
                var RequestingUserId = GetUserId(user);
                _logger.LogError(ex, "error getting data by id for user: {RequestingUserId}", RequestingUserId);
                return null;
            }
        }

        //Employee specific method.
        public async Task<User?> GetMyProfileAsync(int userId)
        {
            try
            {
                return await _dbSet
                    .Include(u => u.RoleAssignments)
                        .ThenInclude(ra => ra.Role)
                    .Include(u => u.Department)
                    .FirstOrDefaultAsync(u => u.ID == userId && u.IsActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting profile data for user: {userId}", userId);
                return null;
            }
        }

        public async Task<IEnumerable<User>> GetMyTeamMembersAsync(int evaluatorId)
        {
            try
            {
                return await _context.EvaluatorAssignments
                    .Where(ea => ea.EvaluatorID == evaluatorId && ea.IsActive)
                    .Include(ea => ea.Employee)
                        .ThenInclude(emp => emp.RoleAssignments)
                            .ThenInclude(ra => ra.Role)
                    .Include(ea => ea.Employee)
                        .ThenInclude(emp => emp.Department)
                    .Select(ea => ea.Employee)
                    .Where(emp => emp.IsActive)
                    .Distinct()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting team members for the user: {evaluatorId}", evaluatorId);
                return new List<User>();
            }
        }

        public async Task<IEnumerable<User>> GetUsersByDepartmentAsync(int departmentId, ClaimsPrincipal user)
        {
            try
            {
                var query = _dbSet
                    .Include(u => u.RoleAssignments.Where(ra => ra.IsActive))
                        .ThenInclude(ra => ra.Role)
                    .Include(u => u.Department)
                    .Where(u => u.DepartmentID == departmentId && u.IsActive);

                // Non-admin users can only see their own department
                if (!IsAdmin(user))
                {
                    var userDeptId = GetDepartmentId(user);
                    if (departmentId != userDeptId)
                    {
                        return new List<User>();
                    }
                }

                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting getting user data by Department");
                return new List<User>();
            }
        }

        public async Task<IEnumerable<User>> GetUsersByRoleAsync(int roleId, ClaimsPrincipal user)
        {
            try
            {
                var query = _dbSet
                    .Include(u => u.RoleAssignments)
                        .ThenInclude(ra => ra.Role)
                    .Include(u => u.Department)
                    .Where(u => u.RoleAssignments.Any(ra => ra.RoleID == roleId) && u.IsActive);

                // Apply department filtering for non-admin users
                if (!IsAdmin(user))
                {
                    var userDeptId = GetDepartmentId(user);
                    query = query.Where(u => u.DepartmentID == userDeptId);
                }

                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting getting user data by Role");
                return new List<User>();
            }
        }

        public async Task<User?> GetWithRolesAndDepartmentAsync(int userId)
        {
            try
            {
                return await _dbSet
                    .Include(u => u.RoleAssignments)
                        .ThenInclude(ra => ra.Role)
                    .Include(u => u.Department)
                    .FirstOrDefaultAsync(u => u.ID == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting getting user data with roles and departments");
                return null;
            }
        }

        public async Task<User?> GetWithRolesAsync(int userId)
        {
            try
            {
                return await _dbSet
                    .Include(u => u.RoleAssignments)
                        .ThenInclude(ra => ra.Role)
                    .FirstOrDefaultAsync(u => u.ID == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting getting user data with roles");
                return null;
            }
        }

        public async Task<bool> IsMyTeamMemberAsync(int evaluatorId, int employeeId)
        {
            try
            {
                return await _context.EvaluatorAssignments
                    .Where(ea => (ea.EvaluatorID == evaluatorId) && ea.IsActive)
                    .Select(ea => ea.TeamID)
                    .AnyAsync(teamId =>
                        _context.EvaluatorAssignments
                            .Any(ea => (ea.TeamID == teamId) &&
                                    (ea.EmployeeID == employeeId) &&
                                    ea.IsActive));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if employee {employeeId} is in the same team with evaluator {evaluatorId}"
                    , employeeId, evaluatorId);
                return false;
            }
        }
        // UserRepository - Add these methods

        public async Task<bool> DeactivateUserAsync(int userId, ClaimsPrincipal requestingUser)
        {
            try
            {
                var RequestingUserId = GetUserId(requestingUser);

                if (!IsAdmin(requestingUser))
                {
                    _logger.LogWarning("User {requestingUserId} attempted to deactivate user {userId} without permission",
                        RequestingUserId, userId);
                    throw new UnauthorizedAccessException("Only administrators can deactivate users");
                }

                var targetUser = await _dbSet.FirstOrDefaultAsync(u => u.ID == userId && u.IsActive);
                if (targetUser == null)
                {
                    return false;
                }

                targetUser.IsActive = false;
                targetUser.UpdatedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("User deactivated: ID {userId} by Admin {adminId}", userId, RequestingUserId);
                return true;
            }
            catch (UnauthorizedAccessException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating user {userId}", userId);
                throw;
            }
        }

        public async Task<bool> ReactivateUserAsync(int userId, ClaimsPrincipal requestingUser)
        {
            try
            {
                var RequestingUserId = GetUserId(requestingUser);

                if (!IsAdmin(requestingUser))
                {
                    throw new UnauthorizedAccessException("Only administrators can reactivate users");
                }

                var targetUser = await _dbSet.FirstOrDefaultAsync(u => u.ID == userId && !u.IsActive);
                if (targetUser == null)
                {
                    return false;
                }

                targetUser.IsActive = true;
                targetUser.UpdatedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("User reactivated: ID {userId} by Admin {adminId}", userId, RequestingUserId);
                return true;
            }
            catch (UnauthorizedAccessException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating user {userId}", userId);
                throw;
            }
        }

        public async Task<bool> CascadeDeactivateUserAsync(int userId, ClaimsPrincipal requestingUser)
        {
            try
            {
                var RequestingUserId = GetUserId(requestingUser);

                if (!IsAdmin(requestingUser))
                {
                    throw new UnauthorizedAccessException("Only administrators can cascade deactivate users");
                }

                var targetUser = await _dbSet
                    .Include(u => u.RoleAssignments.Where(ra => ra.IsActive))
                    .Include(u => u.EvaluatorAssignments.Where(ea => ea.IsActive))
                    .Include(u => u.EmployeeAssignments.Where(ea => ea.IsActive))
                    .Include(u => u.EvaluatorEvaluations.Where(e => e.IsActive))
                        .ThenInclude(e => e.EvaluationScores.Where(es => es.IsActive))
                            .ThenInclude(es => es.Comments.Where(c => c.IsActive))
                    .FirstOrDefaultAsync(u => u.ID == userId && u.IsActive);

                if (targetUser == null)
                {
                    return false;
                }

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    var deactivationTime = DateTime.UtcNow;

                    // Deactivate all related entities
                    foreach (var roleAssignment in targetUser.RoleAssignments.Where(ra => ra.IsActive))
                    {
                        roleAssignment.IsActive = false;
                    }

                    foreach (var assignment in targetUser.EvaluatorAssignments.Where(ea => ea.IsActive))
                    {
                        assignment.IsActive = false;
                    }

                    foreach (var assignment in targetUser.EmployeeAssignments.Where(ea => ea.IsActive))
                    {
                        assignment.IsActive = false;
                    }

                    foreach (var evaluation in targetUser.EvaluatorEvaluations.Where(e => e.IsActive))
                    {
                        evaluation.IsActive = false;

                        foreach (var score in evaluation.EvaluationScores.Where(es => es.IsActive))
                        {
                            score.IsActive = false;

                            foreach (var comment in score.Comments.Where(c => c.IsActive))
                            {
                                comment.IsActive = false;
                                comment.UpdatedDate = deactivationTime;
                            }
                        }
                    }

                    // Deactivate the user
                    targetUser.IsActive = false;
                    targetUser.UpdatedDate = deactivationTime;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    _logger.LogInformation("User and related data cascade deactivated: ID {userId} by Admin {adminId}",
                        userId, RequestingUserId);
                    return true;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Error during cascade deactivation for user {userId}", userId);
                    throw;
                }
            }
            catch (UnauthorizedAccessException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cascade deactivating user {userId}", userId);
                throw;
            }
        }
        
        public async Task<User?> GetByIdWithRolesAsync(int userId)
        {
            try
            {
                return await _dbSet
                    .Include(u => u.RoleAssignments.Where(ra => ra.IsActive)) // Only active role assignments
                        .ThenInclude(ra => ra.Role)
                    .Include(u => u.Department)
                    .FirstOrDefaultAsync(u => u.ID == userId && u.IsActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user {userId} with roles", userId);
                return null;
            }
        }
    }
}