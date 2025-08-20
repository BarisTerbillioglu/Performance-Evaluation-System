using System.Security.Claims;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Application.DTOs.CriteriaCategory;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;

namespace PerformanceEvaluation.Application.Services.Implementations
{
    public class CriteriaCategoryService : ICriteriaCategoryService
    {
        private readonly ICriteriaCategoryRepository _categoryRepository;
        private readonly ICriteriaRepository _criteriaRepository;
        private readonly ILogger<CriteriaCategoryService> _logger;

        public CriteriaCategoryService(
            ICriteriaCategoryRepository categoryRepository,
            ICriteriaRepository criteriaRepository,
            ILogger<CriteriaCategoryService> logger)
        {
            _categoryRepository = categoryRepository;
            _criteriaRepository = criteriaRepository;
            _logger = logger;
        }

        public async Task<CriteriaCategoryDto> CreateCategoryAsync(CreateCriteriaCategoryRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can create criteria categories");
            }

            // Validate that total weights don't exceed 100%
            var currentTotalWeight = await _categoryRepository.GetTotalWeightAsync();
            if (currentTotalWeight + request.Weight > 100)
            {
                throw new ArgumentException($"Total weight would exceed 100%. Current total: {currentTotalWeight}%, Requested: {request.Weight}%");
            }

            var category = new CriteriaCategory
            {
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                Weight = request.Weight,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            var createdCategory = await _categoryRepository.AddAsync(category);

            _logger.LogInformation("Criteria category created: ID {CategoryId} by User {UserId}", 
                createdCategory.ID, GetUserId(user));

            return MapToDto(createdCategory);
        }

        public async Task<CriteriaCategoryDto?> UpdateCategoryAsync(int id, UpdateCriteriaCategoryRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can update criteria categories");
            }

            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                return null;
            }

            // Validate weight changes
            if (request.Weight.HasValue && request.Weight.Value != category.Weight)
            {
                var currentTotalWeight = await _categoryRepository.GetTotalWeightAsync();
                var newTotalWeight = currentTotalWeight - category.Weight + request.Weight.Value;
                
                if (newTotalWeight > 100)
                {
                    throw new ArgumentException($"Total weight would exceed 100%. Current total: {currentTotalWeight}%, New total would be: {newTotalWeight}%");
                }
                
                category.Weight = request.Weight.Value;
            }

            category.Name = request.Name?.Trim() ?? category.Name;
            category.Description = request.Description?.Trim() ?? category.Description;
            category.IsActive = request.IsActive ?? category.IsActive;
            category.UpdatedDate = DateTime.UtcNow;

            var updatedCategory = await _categoryRepository.UpdateAsync(category);

            _logger.LogInformation("Criteria category updated: ID {CategoryId} by User {UserId}", 
                id, GetUserId(user));

            return MapToDto(updatedCategory);
        }

        public async Task<bool> DeactivateCriteriaCategoryAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can deactivate criteria categories");
            }

            var result = await _categoryRepository.DeactivateAsync(id);

            if (result)
            {
                _logger.LogInformation("Criteria category deactivated: ID {CategoryId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<bool> ReactivateCriteriaCategoryAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can reactivate criteria categories");
            }

            var result = await _categoryRepository.ReactivateAsync(id);

            if (result)
            {
                _logger.LogInformation("Criteria category reactivated: ID {CategoryId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<bool> CascadeDeactivateCriteriaCategoryAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can cascade deactivate criteria categories");
            }

            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                return false;
            }

            using var transaction = await _categoryRepository.BeginTransactionAsync();
            
            try
            {
                // First, deactivate all criteria in this category
                var criteria = await _categoryRepository.GetCategoryCriteriaAsync(id);
                foreach (var criterion in criteria.Where(c => c.IsActive))
                {
                    await _criteriaRepository.DeactivateAsync(criterion.ID);
                }

                // Then deactivate the category
                await _categoryRepository.DeactivateAsync(id);

                await transaction.CommitAsync();

                _logger.LogInformation("Criteria category and criteria cascade deactivated: ID {CategoryId} by Admin {UserId}", 
                    id, GetUserId(user));

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error during cascade deactivation for criteria category {CategoryId}", id);
                throw;
            }
        }

        // Update existing DeleteCriteriaCategoryAsync for permanent deletion
        public async Task<bool> DeleteCriteriaCategoryAsync(int id, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can permanently delete criteria categories");
            }

            // Check for ANY criteria (active or inactive)
            var criteria = await _categoryRepository.GetCategoryCriteriaAsync(id);
            if (criteria.Any())
            {
                throw new InvalidOperationException(
                    $"Cannot permanently delete criteria category. Category has {criteria.Count()} criteria. " +
                    "Consider using cascade deactivation instead.");
            }

            var result = await _categoryRepository.DeleteAsync(id);

            if (result)
            {
                _logger.LogWarning("Criteria category permanently deleted: ID {CategoryId} by Admin {UserId}", 
                    id, GetUserId(user));
            }

            return result;
        }

        public async Task<IEnumerable<CriteriaCategoryDto>> GetAllCategoriesAsync(ClaimsPrincipal user)
        {
            var categories = await _categoryRepository.GetAllAsync(user);
            return categories.Select(MapToDto);
        }

        public async Task<CriteriaCategoryDto?> GetCategoryByIdAsync(int id, ClaimsPrincipal user)
        {
            var category = await _categoryRepository.GetByIdAsync(id, user);
            return category != null ? MapToDto(category) : null;
        }

        public async Task<CriteriaCategoryWithCriteriaDto?> GetCategoryWithCriteriaAsync(int id, ClaimsPrincipal user)
        {
            var category = await _categoryRepository.GetCategoryWithCriteriaAsync(id);
            
            if (category == null || (!user.IsInRole("Admin") && !category.IsActive))
            {
                return null;
            }

            var criteriaList = category.Criteria;
            if (!user.IsInRole("Admin"))
            {
                criteriaList = criteriaList.Where(c => c.IsActive).ToList();
            }

            return new CriteriaCategoryWithCriteriaDto
            {
                Id = category.ID,
                Name = category.Name,
                Description = category.Description,
                Weight = category.Weight,
                IsActive = category.IsActive,
                CreatedDate = category.CreatedDate,
                UpdatedDate = category.UpdatedDate,
                CriteriaCount = criteriaList.Count(),
                Criteria = criteriaList.Select(c => new CriteriaSummaryDto
                {
                    Id = c.ID,
                    Name = c.Name,
                    BaseDescription = c.BaseDescription,
                    IsActive = c.IsActive,
                    CreatedDate = c.CreatedDate
                }).ToList()
            };
        }

        public async Task<IEnumerable<CriteriaCategoryDto>> GetActiveCategoriesAsync()
        {
            var categories = await _categoryRepository.GetActiveCategoriesAsync();
            return categories.Select(MapToDto);
        }

        public async Task<WeightValidationDto> ValidateWeightsAsync(ClaimsPrincipal user)
        {
            var totalWeight = await _categoryRepository.GetTotalWeightAsync();
            var isValid = await _categoryRepository.ValidateWeightsAsync();
            
            var categories = await _categoryRepository.GetActiveCategoriesAsync();
            
            return new WeightValidationDto
            {
                TotalWeight = totalWeight,
                IsValid = isValid,
                RemainingWeight = 100 - totalWeight,
                Categories = categories.Select(c => new CategoryWeightDto
                {
                    Id = c.ID,
                    Name = c.Name,
                    Weight = c.Weight
                }).ToList()
            };
        }

        public async Task<bool> RebalanceWeightsAsync(List<RebalanceWeightRequest> requests, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can rebalance weights");
            }

            // Validate total weights equal 100%
            var totalWeight = requests.Sum(r => r.Weight);
            if (Math.Abs(totalWeight - 100) > 0.01m)
            {
                throw new ArgumentException($"Total weights must equal 100%. Provided total: {totalWeight}%");
            }

            // Update each category
            foreach (var request in requests)
            {
                var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
                if (category == null)
                {
                    throw new ArgumentException($"Category with ID {request.CategoryId} not found");
                }

                category.Weight = request.Weight;
                category.UpdatedDate = DateTime.UtcNow;
                await _categoryRepository.UpdateAsync(category);
            }

            _logger.LogInformation("Criteria category weights rebalanced by User {UserId}", GetUserId(user));
            return true;
        }

        private CriteriaCategoryDto MapToDto(CriteriaCategory category)
        {
            return new CriteriaCategoryDto
            {
                Id = category.ID,
                Name = category.Name,
                Description = category.Description,
                Weight = category.Weight,
                IsActive = category.IsActive,
                CreatedDate = category.CreatedDate,
                UpdatedDate = category.UpdatedDate
            };
        }

        private int GetUserId(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }
    }
}