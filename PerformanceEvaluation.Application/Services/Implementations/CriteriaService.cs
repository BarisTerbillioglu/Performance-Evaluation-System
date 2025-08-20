using System.Security.Claims;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Application.DTOs.Criteria;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Enums;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Application.Services.Implementations
{
    public class CriteriaService : ICriteriaService
    {
        private readonly ICriteriaRepository _criteriaRepository;
        private readonly ICriteriaCategoryRepository _categoryRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly ILogger<CriteriaService> _logger;

        public CriteriaService(
            ICriteriaRepository criteriaRepository,
            ICriteriaCategoryRepository categoryRepository,
            IRoleRepository roleRepository,
            ILogger<CriteriaService> logger)
        {
            _criteriaRepository = criteriaRepository;
            _categoryRepository = categoryRepository;
            _roleRepository = roleRepository;
            _logger = logger;
        }

        public async Task<CriteriaDto> CreateCriteriaAsync(CreateCriteriaRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can create criteria");
            }

            var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
            if (category == null)
            {
                throw new ArgumentException("Category not found");
            }

            var criteria = new Criteria
            {
                CategoryID = request.CategoryId,
                Name = request.Name.Trim(),
                BaseDescription = request.BaseDescription?.Trim(),
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            var createdCriteria = await _criteriaRepository.AddAsync(criteria);

            _logger.LogInformation("Criteria created: ID {CriteriaId} by User {UserId}", 
                createdCriteria.ID, GetUserId(user));

            return MapToDto(createdCriteria);
        }

        public async Task<CriteriaDto?> UpdateCriteriaAsync(int id, UpdateCriteriaRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can update criteria");
            }

            var criteria = await _criteriaRepository.GetByIdAsync(id);
            if (criteria == null)
            {
                return null;
            }

            criteria.Name = request.Name?.Trim() ?? criteria.Name;
            criteria.BaseDescription = request.BaseDescription?.Trim() ?? criteria.BaseDescription;
            criteria.IsActive = request.IsActive ?? criteria.IsActive;

            if (request.CategoryId.HasValue)
            {
                var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value);
                if (category == null)
                {
                    throw new ArgumentException("Category not found");
                }
                criteria.CategoryID = request.CategoryId.Value;
            }

            var updatedCriteria = await _criteriaRepository.UpdateAsync(criteria);

            _logger.LogInformation("Criteria updated: ID {CriteriaId} by User {UserId}", 
                id, GetUserId(user));

            return MapToDto(updatedCriteria);
        }

        public async Task<bool> DeactivateCriteriaAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can deactivate criteria");
            }

            var result = await _criteriaRepository.DeactivateAsync(id);

            if (result)
            {
                _logger.LogInformation("Criteria deactivated: ID {CriteriaId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<bool> ReactivateCriteriaAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can reactivate criteria");
            }

            var result = await _criteriaRepository.ReactivateAsync(id);

            if (result)
            {
                _logger.LogInformation("Criteria reactivated: ID {CriteriaId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<bool> CascadeDeactivateCriteriaAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can cascade deactivate criteria");
            }

            var criteria = await _criteriaRepository.GetByIdAsync(id);
            if (criteria == null)
            {
                return false;
            }

            // Check for active evaluation scores using this criteria
            var hasActiveScores = await _criteriaRepository.HasActiveEvaluationScoresAsync(id);
            if (hasActiveScores)
            {
                throw new InvalidOperationException(
                    "Cannot deactivate criteria. Criteria is being used in active evaluations. " +
                    "Complete or deactivate related evaluations first.");
            }

            var result = await _criteriaRepository.DeactivateAsync(id);

            if (result)
            {
                _logger.LogInformation("Criteria cascade deactivated: ID {CriteriaId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<bool> DeleteCriteriaAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can permanently delete criteria");
            }

            // Check for ANY evaluation scores (active or inactive)
            var hasScores = await _criteriaRepository.HasEvaluationScoresAsync(id);
            if (hasScores)
            {
                throw new InvalidOperationException(
                    "Cannot permanently delete criteria. Criteria has evaluation scores. " +
                    "Consider using deactivation instead.");
            }

            var result = await _criteriaRepository.DeleteAsync(id);

            if (result)
            {
                _logger.LogWarning("Criteria permanently deleted: ID {CriteriaId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<IEnumerable<CriteriaDto>> GetAllCriteriaAsync(ClaimsPrincipal user)
        {
            var criteria = await _criteriaRepository.GetAllAsync(user);
            return criteria.Select(MapToDto);
        }

        public async Task<CriteriaDto?> GetCriteriaByIdAsync(int id, ClaimsPrincipal user)
        {
            var criteria = await _criteriaRepository.GetByIdAsync(id, user);
            return criteria != null ? MapToDto(criteria) : null;
        }

        public async Task<IEnumerable<CriteriaDto>> GetCriteriaByCategoryAsync(int categoryId, ClaimsPrincipal user)
        {
            var criteria = await _criteriaRepository.GetCriteriaByCategoryAsync(categoryId);
            
            // Apply role-based filtering for non-admin users
            if (!user.IsInRole("Admin"))
            {
                criteria = criteria.Where(c => c.IsActive);
            }

            return criteria.Select(MapToDto);
        }

        public async Task<IEnumerable<CriteriaDto>> GetCriteriaForRoleAsync(SystemRole systemRole, JobRoleType jobRole, ClaimsPrincipal user)
        {
            var criteria = await _criteriaRepository.GetCriteriaForRoleAsync(systemRole, jobRole);
            return criteria.Select(MapToDto);
        }

        public async Task<CriteriaWithRoleDescriptionDto?> GetCriteriaWithRoleDescriptionAsync(int criteriaId, int roleId, ClaimsPrincipal user)
        {
            var criteria = await _criteriaRepository.GetCriteriaWithRoleDescriptionAsync(criteriaId, roleId);
            
            if (criteria == null)
            {
                return null;
            }

            var roleDescription = criteria.RoleCriteriaDescriptions.FirstOrDefault(rcd => rcd.RoleID == roleId);

            return new CriteriaWithRoleDescriptionDto
            {
                Id = criteria.ID,
                Name = criteria.Name,
                CategoryName = criteria.CriteriaCategory?.Name ?? "",
                CategoryWeight = criteria.CriteriaCategory?.Weight ?? 0,
                BaseDescription = criteria.BaseDescription,
                RoleDescription = roleDescription?.Description,
                RoleExample = roleDescription?.Example,
                IsActive = criteria.IsActive
            };
        }

        public async Task<CriteriaRoleDescriptionDto> AddRoleDescriptionAsync(AddRoleDescriptionRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can add role descriptions");
            }

            var criteria = await _criteriaRepository.GetByIdAsync(request.CriteriaId);
            if (criteria == null)
            {
                throw new ArgumentException("Criteria not found");
            }

            var role = await _roleRepository.GetByIdAsync(request.RoleId);
            if (role == null)
            {
                throw new ArgumentException("Role not found");
            }

            var roleDescription = new RoleCriteriaDescription
            {
                CriteriaID = request.CriteriaId,
                RoleID = request.RoleId,
                Description = request.Description.Trim(),
                Example = request.Example?.Trim()
            };

            var addedDescription = await _criteriaRepository.AddRoleDescriptionAsync(roleDescription);

            _logger.LogInformation("Role description added: CriteriaId {CriteriaId}, RoleId {RoleId} by User {UserId}", 
                request.CriteriaId, request.RoleId, GetUserId(user));

            return new CriteriaRoleDescriptionDto
            {
                Id = addedDescription.ID,
                CriteriaId = addedDescription.CriteriaID,
                RoleId = addedDescription.RoleID,
                Description = addedDescription.Description,
                Example = addedDescription.Example
            };
        }

        public async Task<CriteriaRoleDescriptionDto?> UpdateRoleDescriptionAsync(int id, UpdateRoleDescriptionRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can update role descriptions");
            }

            var updated = await _criteriaRepository.UpdateRoleDescriptionAsync(id, request.Description, request.Example);

            if (updated == null)
            {
                return null;
            }

            _logger.LogInformation("Role description updated: ID {DescriptionId} by User {UserId}", 
                id, GetUserId(user));

            return new CriteriaRoleDescriptionDto
            {
                Id = updated.ID,
                CriteriaId = updated.CriteriaID,
                RoleId = updated.RoleID,
                Description = updated.Description,
                Example = updated.Example
            };
        }

        public async Task<bool> DeleteRoleDescriptionAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can delete role descriptions");
            }

            var result = await _criteriaRepository.DeleteRoleDescriptionAsync(id);

            if (result)
            {
                _logger.LogInformation("Role description deleted: ID {DescriptionId} by User {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<IEnumerable<CriteriaDto>> GetActiveCriteriaForEvaluationAsync()
        {
            var criteria = await _criteriaRepository.GetActiveCriteriaForEvaluationAsync();
            return criteria.Select(MapToDto);
        }

        private CriteriaDto MapToDto(Criteria criteria)
        {
            return new CriteriaDto
            {
                Id = criteria.ID,
                CategoryId = criteria.CategoryID,
                Name = criteria.Name,
                BaseDescription = criteria.BaseDescription,
                CategoryName = criteria.CriteriaCategory?.Name ?? "",
                CategoryWeight = criteria.CriteriaCategory?.Weight ?? 0,
                IsActive = criteria.IsActive,
                CreatedDate = criteria.CreatedDate,
                RoleDescriptions = criteria.RoleCriteriaDescriptions?.Select(rcd => new CriteriaRoleDescriptionDto
                {
                    Id = rcd.ID,
                    CriteriaId = rcd.CriteriaID,
                    RoleId = rcd.RoleID,
                    Description = rcd.Description,
                    Example = rcd.Example
                }).ToList() ?? new List<CriteriaRoleDescriptionDto>()
            };
        }

        private int GetUserId(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }
    }
}