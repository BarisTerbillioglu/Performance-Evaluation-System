namespace PerformanceEvaluation.Application.DTOs.Evaluation
{
    public class EvaluationDashboardDto
    {
        public Dictionary<string, int> StatusCounts { get; set; } = new();
        public List<EvaluationListDto> RecentEvaluations { get; set; } = new();
        public int TotalEvaluations { get; set; }
        public int CompletedEvaluations { get; set; }
        public int PendingEvaluations { get; set; }
    }
}