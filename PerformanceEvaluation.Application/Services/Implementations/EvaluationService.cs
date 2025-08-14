using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Interfaces;
using PerformanceEvaluation.Core.Enums;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;
using PerformanceEvaluation.Application.DTOs.Evaluation;

namespace PerformanceEvaluation.Application.Services.Implementations
{
    public class EvaluationService : IEvaluationService
    {
        private readonly IEvaluationRepository _evaluationRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICriteriaRepository _criteriaRepository;
        private readonly ILogger<EvaluationService> _logger;

        public EvaluationService(
            IEvaluationRepository evaluationRepository,
            IUserRepository userRepository,
            ICriteriaRepository criteriaRepository,
            ILogger<EvaluationService> logger)
        {
            _evaluationRepository = evaluationRepository;
            _userRepository = userRepository;
            _criteriaRepository = criteriaRepository;
            _logger = logger;
        }

        public Task<Evaluation> CreateEvaluationAsync(CreateEvaluationRequest request, ClaimsPrincipal user)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteEvaluationAsync(int evaluationId, ClaimsPrincipal user)
        {
            throw new NotImplementedException();
        }

        public Task<Evaluation?> GetEvaluationDetailsAsync(int evaluationId, ClaimsPrincipal user)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Evaluation>> GetEvaluationsAsync(ClaimsPrincipal user)
        {
            throw new NotImplementedException();
        }

        public Task<bool> SubmitEvaluationAsync(int evaluationId, ClaimsPrincipal user)
        {
            throw new NotImplementedException();
        }

        public Task<Evaluation?> UpdateEvaluationAsync(int evaluationId, UpdateEvaluationRequest request, ClaimsPrincipal user)
        {
            throw new NotImplementedException();
        }

    /*
        private int GetUserId(ClaimsPrincipal user)
        {

        }

        private decimal CalculateTotalScore(IEnumerable<EvaluationScoreDto> scores)
        {

        }
    */
        
    }
}