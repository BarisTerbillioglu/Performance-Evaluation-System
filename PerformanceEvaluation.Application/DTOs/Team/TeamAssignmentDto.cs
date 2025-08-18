namespace PerformanceEvaluation.Application.DTOs.Team
{
    public class TeamAssignmentDto
    {
        public int Id { get; set; }
        public int TeamId { get; set; }
        public int EvaluatorId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime AssignedDate { get; set; }
        public bool IsActive { get; set; }
    }
}