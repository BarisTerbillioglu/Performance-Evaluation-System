using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Interfaces;

namespace PerformanceEvaluation.Infrastructure.Repositories.Interfaces
{
    public interface IEvaluatorAssignmentRepository : IBaseRepository<EvaluatorAssignment>
    {
        Task<IEnumerable<EvaluatorAssignment>> GetTeamAssignmentsAsync(int teamId);
        Task<IEnumerable<EvaluatorAssignment>> GetEvaluatorAssignmentsAsync(int evaluatorId);
        Task<IEnumerable<EvaluatorAssignment>> GetEmployeeAssignmentsAsync(int employeeId);
        Task<EvaluatorAssignment?> GetEvaluatorTeamAssignmentAsync(int evaluatorId, int teamId);
        Task<EvaluatorAssignment?> GetEvaluatorEmployeeAssignmentAsync(int evaluatorId, int employeeId);
        Task<bool> DeactivateTeamAssignmentAsync(int teamId, int userId);
        Task<bool> DeactivateEvaluatorEmployeeAssignmentAsync(int evaluatorId, int employeeId);
    }
}