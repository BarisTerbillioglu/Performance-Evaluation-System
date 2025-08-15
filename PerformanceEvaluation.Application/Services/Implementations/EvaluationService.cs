using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Enums;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;
using PerformanceEvaluation.Application.DTOs.Evaluation;
using PerformanceEvaluation.Application.DTOs.Criteria;
using PerformanceEvaluation.Application.DTOs.EvaluationScore;
using PerformanceEvaluation.Application.DTOs.Comment;

namespace PerformanceEvaluation.Application.Services.Implementations
{
    public class EvaluationService : IEvaluationService
    {
        private readonly IEvaluationRepository _evaluationRepository;
        private readonly IEvaluationScoreRepository _scoreRepository;
        private readonly ICommentRepository _commentRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICriteriaRepository _criteriaRepository;
        private readonly ILogger<EvaluationService> _logger;

        public EvaluationService(
            IEvaluationRepository evaluationRepository,
            IEvaluationScoreRepository scoreRepository,
            ICommentRepository commentRepository,
            IUserRepository userRepository,
            ICriteriaRepository criteriaRepository,
            ILogger<EvaluationService> logger)
        {
            _evaluationRepository = evaluationRepository;
            _scoreRepository = scoreRepository;
            _commentRepository = commentRepository;
            _userRepository = userRepository;
            _criteriaRepository = criteriaRepository;
            _logger = logger;
        }

        public async Task<EvaluationDto> CreateEvaluationAsync(CreateEvaluationRequest request, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Evaluator") && !user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only evaluators and admins can create evaluations");
            }

            var evaluatorId = GetUserId(user);
            if (user.IsInRole("Evaluator"))
            {
                var canEvaluate = await _evaluationRepository.CanEvaluateEmployeeAsync(evaluatorId, request.EmployeeID);
                if (!canEvaluate)
                {
                    throw new UnauthorizedAccessException("You cannot evaluate this employee");
                }
            }

            var Employee = await _userRepository.GetByIdAsync(request.EmployeeID, user);
            if (Employee == null)
            {
                throw new ArgumentException("Employee not found or not accessible");
            }

            var evaluation = await _evaluationRepository.CreateEvaluationAsync(request.EmployeeID, request.Period, request.StartDate, request.EndDate, user);

            return new EvaluationDto
            {
                Id = evaluation.ID,
                EvaluatorId = evaluation.EvaluatorID,
                EmployeeId = evaluation.EmployeeID,
                Period = evaluation.Period,
                StartDate = evaluation.StartDate,
                EndDate = evaluation.EndDate,
                Status = evaluation.Status,
                TotalScore = evaluation.TotalScore,
                GeneralComments = evaluation.GeneralComments,
                CreatedDate = evaluation.CreatedDate,
                CompletedDate = evaluation.CompletedDate
            };
        }

        /// <summary>
        /// Gets evaluation form with scores and comments mapped to DTO
        /// </summary>
        public async Task<EvaluationFormDto?> GetEvaluationFormAsync(int evaluationId, ClaimsPrincipal user)
        {
            // Get evaluation with scores
            var evaluation = await _evaluationRepository.GetEvaluationWithScoresAsync(evaluationId, user);
            if (evaluation == null) return null;

            // Get all criteria with scores
            var criteriaWithScores = new List<CriteriaWithScoreDto>();

            // Get all active criteria
            var allCriteria = await _criteriaRepository.GetActiveCriteriaForEvaluationAsync();

            foreach (var criteria in allCriteria)
            {
                // Find score for this criteria
                var score = evaluation.EvaluationScores?.FirstOrDefault(es => es.CriteriaID == criteria.ID);

                // Get comments for this score
                var comments = new List<string>();
                if (score != null)
                {
                    var scoreComments = await _commentRepository.GetByEvaluationScoreIdAsync(score.ID);
                    comments = scoreComments.Select(c => c.Description).ToList();
                }

                criteriaWithScores.Add(new CriteriaWithScoreDto
                {
                    CriteriaId = criteria.ID,
                    Name = criteria.Name,
                    CategoryName = criteria.CriteriaCategory.Name,
                    CategoryWeight = criteria.CriteriaCategory.Weight,
                    BaseDescription = criteria.BaseDescription,
                    Score = score?.Score,
                    Comments = comments
                });
            }

            // Map to DTO
            return new EvaluationFormDto
            {
                EvaluationId = evaluation.ID,
                EmployeeName = $"{evaluation.Employee.FirstName} {evaluation.Employee.LastName}",
                EvaluatorName = $"{evaluation.Evaluator.FirstName} {evaluation.Evaluator.LastName}",
                Period = evaluation.Period,
                Status = evaluation.Status,
                TotalScore = evaluation.TotalScore,
                GeneralComments = evaluation.GeneralComments,
                CriteriaWithScores = criteriaWithScores
            };
        }

        /// <summary>
        /// Gets evaluation summary mapped to DTO
        /// </summary>
        public async Task<EvaluationSummaryDto?> GetEvaluationSummaryAsync(int evaluationId, ClaimsPrincipal user)
        {
            var evaluation = await _evaluationRepository.GetEvaluationForSummaryAsync(evaluationId, user);
            if (evaluation == null) return null;

            // Get comment count separately
            var commentCount = await _commentRepository.GetCommentCountByEvaluationAsync(evaluationId);

            // Map entity to DTO
            return new EvaluationSummaryDto
            {
                EvaluationId = evaluation.ID,
                EmployeeName = $"{evaluation.Employee.FirstName} {evaluation.Employee.LastName}",
                EvaluatorName = $"{evaluation.Evaluator.FirstName} {evaluation.Evaluator.LastName}",
                DepartmentName = evaluation.Employee.Department.Name,
                Period = evaluation.Period,
                TotalScore = evaluation.TotalScore,
                Status = evaluation.Status,
                CreatedDate = evaluation.CreatedDate,
                CompletedDate = evaluation.CompletedDate,
                ScoreCount = evaluation.EvaluationScores?.Count ?? 0,
                CommentCount = commentCount,
                IsComplete = await _scoreRepository.HasAllRequiredScoresAsync(evaluationId)
            };
        }

        /// <summary>
        /// Gets evaluation list mapped to DTOs
        /// </summary>
        public async Task<IEnumerable<EvaluationListDto>> GetEvaluationListAsync(ClaimsPrincipal user)
        {
            var evaluations = await _evaluationRepository.GetAllAsync(user);

            // Map entities to DTOs
            return evaluations.Select(e => new EvaluationListDto
            {
                Id = e.ID,
                EmployeeName = $"{e.Employee.FirstName} {e.Employee.LastName}",
                EvaluatorName = $"{e.Evaluator.FirstName} {e.Evaluator.LastName}",
                DepartmentName = e.Employee.Department.Name,
                Period = e.Period,
                Status = e.Status,
                TotalScore = e.TotalScore,
                CreatedDate = e.CreatedDate,
                CompletedDate = e.CompletedDate
            });
        }

        /// <summary>
        /// Updates score and returns DTO
        /// </summary>
        public async Task<EvaluationScoreDto> UpdateScoreAsync(UpdateScoreRequest request, ClaimsPrincipal user)
        {
            var score = await _scoreRepository.AddOrUpdateScoreAsync(
                request.EvaluationId,
                request.CriteriaId,
                request.Score,
                user);

            // Recalculate total score
            var totalScore = await _scoreRepository.CalculateTotalScoreAsync(request.EvaluationId);
            await _evaluationRepository.UpdateTotalScoreAsync(request.EvaluationId, totalScore);

            // Map entity to DTO
            return new EvaluationScoreDto
            {
                Id = score.ID,
                EvaluationId = score.EvaluationID,
                CriteriaId = score.CriteriaID,
                CriteriaName = score.Criteria?.Name ?? "",
                Score = score.Score,
                CreatedDate = score.CreatedDate
            };
        }

        /// <summary>
        /// Adds comment and returns DTO
        /// </summary>
        public async Task<CommentDto> AddCommentToScoreAsync(AddCommentRequest request, ClaimsPrincipal user)
        {
            // Get the score first
            var score = await _scoreRepository.GetByEvaluationAndCriteriaAsync(
                request.EvaluationId, 
                request.CriteriaId);

            if (score == null)
            {
                throw new ArgumentException("Score not found for this criteria");
            }

            var comment = await _commentRepository.AddCommentAsync(score.ID, request.Comment, user);

            // Map entity to DTO
            return new CommentDto
            {
                Id = comment.ID,
                ScoreId = comment.ScoreID,
                Description = comment.Description,
                CreatedDate = comment.CreatedDate,
                UpdatedDate = comment.UpdatedDate,
                IsActive = comment.IsActive
            };
        }

        /// <summary>
        /// Updates comment and returns DTO
        /// </summary>
        public async Task<CommentDto?> UpdateCommentAsync(UpdateCommentRequest request, ClaimsPrincipal user)
        {
            var comment = await _commentRepository.UpdateCommentAsync(
                request.CommentId,
                request.Description,
                user);

            if (comment == null) return null;

            // Map entity to DTO
            return new CommentDto
            {
                Id = comment.ID,
                ScoreId = comment.ScoreID,
                Description = comment.Description,
                CreatedDate = comment.CreatedDate,
                UpdatedDate = comment.UpdatedDate,
                IsActive = comment.IsActive
            };
        }

        /// <summary>
        /// Gets comments for evaluation score mapped to DTOs
        /// </summary>
        public async Task<IEnumerable<CommentDto>> GetCommentsForScoreAsync(int evaluationId, int criteriaId, ClaimsPrincipal user)
        {
            // Get the score first
            var score = await _scoreRepository.GetByEvaluationAndCriteriaAsync(evaluationId, criteriaId);
            if (score == null) return new List<CommentDto>();

            // Check access
            if (!await _scoreRepository.CanUserAccessScoreAsync(evaluationId, user))
            {
                return new List<CommentDto>();
            }

            var comments = await _commentRepository.GetByEvaluationScoreIdAsync(score.ID);

            // Map entities to DTOs
            return comments.Select(c => new CommentDto
            {
                Id = c.ID,
                ScoreId = c.ScoreID,
                Description = c.Description,
                CreatedDate = c.CreatedDate,
                UpdatedDate = c.UpdatedDate,
                IsActive = c.IsActive
            });
        }
        /// <summary>
        /// Gets evaluations by status mapped to DTOs
        /// </summary>
        public async Task<IEnumerable<EvaluationListDto>> GetEvaluationsByStatusAsync(EvaluationStatus status, ClaimsPrincipal user)
        {
            var evaluations = await _evaluationRepository.GetEvaluationsByStatusAsync(status, user);
            
            // Map entities to DTOs
            return evaluations.Select(e => new EvaluationListDto
            {
                Id = e.ID,
                EmployeeName = $"{e.Employee.FirstName} {e.Employee.LastName}",
                EvaluatorName = $"{e.Evaluator.FirstName} {e.Evaluator.LastName}",
                DepartmentName = e.Employee.Department.Name,
                Period = e.Period,
                Status = e.Status,
                TotalScore = e.TotalScore,
                CreatedDate = e.CreatedDate,
                CompletedDate = e.CompletedDate
            });
        }

        /// <summary>
        /// Gets evaluations by period mapped to DTOs
        /// </summary>
        public async Task<IEnumerable<EvaluationListDto>> GetEvaluationsByPeriodAsync(string period, ClaimsPrincipal user)
        {
            var evaluations = await _evaluationRepository.GetEvaluationsByPeriodAsync(period, user);
            
            // Map entities to DTOs
            return evaluations.Select(e => new EvaluationListDto
            {
                Id = e.ID,
                EmployeeName = $"{e.Employee.FirstName} {e.Employee.LastName}",
                EvaluatorName = $"{e.Evaluator.FirstName} {e.Evaluator.LastName}",
                DepartmentName = e.Employee.Department.Name,
                Period = e.Period,
                Status = e.Status,
                TotalScore = e.TotalScore,
                CreatedDate = e.CreatedDate,
                CompletedDate = e.CompletedDate
            });
        }

        /// <summary>
        /// Gets recent evaluations for dashboard
        /// </summary>
        public async Task<IEnumerable<EvaluationListDto>> GetRecentEvaluationsAsync(ClaimsPrincipal user, int limit = 10)
        {
            var evaluations = await _evaluationRepository.GetRecentEvaluationsAsync(user, limit);
            
            // Map entities to DTOs
            return evaluations.Select(e => new EvaluationListDto
            {
                Id = e.ID,
                EmployeeName = $"{e.Employee.FirstName} {e.Employee.LastName}",
                EvaluatorName = $"{e.Evaluator.FirstName} {e.Evaluator.LastName}",
                DepartmentName = e.Employee.Department.Name,
                Period = e.Period,
                Status = e.Status,
                TotalScore = e.TotalScore,
                CreatedDate = e.CreatedDate,
                CompletedDate = e.CompletedDate
            });
        }

        /// <summary>
        /// Gets dashboard data mapped to DTO
        /// </summary>
        public async Task<EvaluationDashboardDto> GetDashboardDataAsync(ClaimsPrincipal user)
        {
            // Get status counts (stays as Dictionary<string, int>)
            var statusCounts = await _evaluationRepository.GetEvaluationCountsByStatusAsync(user);
            
            // Get recent evaluations
            var recentEvaluations = await GetRecentEvaluationsAsync(user, 5);

            return new EvaluationDashboardDto
            {
                StatusCounts = statusCounts,
                RecentEvaluations = recentEvaluations.ToList(),
                TotalEvaluations = statusCounts.Values.Sum(),
                CompletedEvaluations = statusCounts.GetValueOrDefault("Completed", 0),
                PendingEvaluations = statusCounts.GetValueOrDefault("Draft", 0) + statusCounts.GetValueOrDefault("InProgress", 0)
            };
        }
        public async Task<bool> DeleteEvaluationAsync(int evaluationId, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Only administrators can delete evaluations");
            }

            var evaluation = await _evaluationRepository.GetByIdAsync(evaluationId);

            if (evaluation == null)
            {
                return false;
            }

            var result = await _evaluationRepository.DeleteAsync(evaluationId);

            if (result)
            {
                _logger.LogInformation("Evaluation deleted: ID {EvaluationId} by User {UserId}",
                    evaluationId, GetUserId(user));
            }

            return result;
        }

        public async Task<Evaluation?> GetEvaluationDetailsAsync(int evaluationId, ClaimsPrincipal user)
        {
            return await _evaluationRepository.GetByIdAsync(evaluationId, user);
        }

        public async Task<IEnumerable<Evaluation>> GetEvaluationsAsync(ClaimsPrincipal user)
        {
            return await _evaluationRepository.GetAllAsync(user);
        }

        public async Task<bool> SubmitEvaluationAsync(int evaluationId, ClaimsPrincipal user)
        {
            if (!user.IsInRole("Admin") && !user.IsInRole("Evaluator"))
            {
                throw new UnauthorizedAccessException("Only evaluators and admins can submit evaluations");
            }

            // Validate completion using score repository
            var hasAllScores = await _scoreRepository.HasAllRequiredScoresAsync(evaluationId);
            if (!hasAllScores)
            {
                throw new InvalidOperationException("All criteria must have scores before submission");
            }

            // Update status using evaluation repository
            return await _evaluationRepository.UpdateEvaluationStatusAsync(
                evaluationId,
                EvaluationStatus.Completed,
                user);
        }

        /// <summary>
        /// Updates evaluation with optional score and comment updates using composition
        /// </summary>
        public async Task<bool> UpdateEvaluationAsync(UpdateEvaluationRequest request, ClaimsPrincipal user)
        {
            using var transaction = await _evaluationRepository.BeginTransactionAsync();
            try
            {
                // 1. Update evaluation basic info (if provided)
                if (request.HasEvaluationUpdates)
                {
                    await _evaluationRepository.UpdateBasicInfoAsync(request.EvaluationId, 
                        request.Period,
                        request.StartDate,
                        request.EndDate,
                        request.GeneralComments,
                        user);
                }

                // 2. Update scores (if provided)
                if (request.ScoreUpdates?.Any() == true)
                {
                    foreach (var scoreUpdate in request.ScoreUpdates)
                    {
                        await _scoreRepository.AddOrUpdateScoreAsync(
                            request.EvaluationId,
                            scoreUpdate.CriteriaId,
                            scoreUpdate.Score,
                            user);
                    }
                }

                // 3. Update comments (if provided)
                if (request.CommentUpdates?.Any() == true)
                {
                    foreach (var commentUpdate in request.CommentUpdates)
                    {
                        if (commentUpdate.CommentId > 0)
                        {
                            // Update existing comment
                            await _commentRepository.UpdateCommentAsync(
                                commentUpdate.CommentId,
                                commentUpdate.Description,
                                user);
                        }
                        else
                        {
                            // Add new comment to score
                            var score = await _scoreRepository.GetByEvaluationAndCriteriaAsync(
                                request.EvaluationId,
                                commentUpdate.CriteriaId);

                            if (score != null)
                            {
                                await _commentRepository.AddCommentAsync(
                                    score.ID,
                                    commentUpdate.Description,
                                    user);
                            }
                        }
                    }
                }

                // 4. Recalculate total score if scores were updated
                if (request.ScoreUpdates?.Any() == true)
                {
                    var totalScore = await _scoreRepository.CalculateTotalScoreAsync(request.EvaluationId);
                    await _evaluationRepository.UpdateTotalScoreAsync(request.EvaluationId, totalScore);
                }

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error updating evaluation {EvaluationId}", request.EvaluationId);
                throw;
            }
        }


        private int GetUserId(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out int userId) ? userId : 0;
        }
    }
}