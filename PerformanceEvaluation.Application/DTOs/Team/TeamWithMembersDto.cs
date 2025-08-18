using PerformanceEvaluation.Application.DTOs.User;


namespace PerformanceEvaluation.Application.DTOs.Team
{
    public class TeamWithMembersDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<UserSummaryDto> Evaluators { get; set; } = new();
        public List<UserSummaryDto> Employees { get; set; } = new();
    }
}