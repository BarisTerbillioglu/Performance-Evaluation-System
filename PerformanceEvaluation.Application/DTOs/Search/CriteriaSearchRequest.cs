using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class CriteriaSearchRequest : BaseSearchRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<int> CategoryIds { get; set; } = new();
        public bool? IsActive { get; set; }
        public List<SystemRole> SystemRoles { get; set; } = new();
        public List<JobRoleType> JobRoles { get; set; } = new();
    }
}