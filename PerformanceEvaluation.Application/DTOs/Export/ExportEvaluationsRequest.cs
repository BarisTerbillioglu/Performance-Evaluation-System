using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.Application.DTOs.Export
{
    public class ExportEvaluationsRequest
        {
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public int? DepartmentId { get; set; }
            public EvaluationStatus? Status { get; set; }
            public List<int> UserIds { get; set; } = new();
            public bool IncludeScores { get; set; } = true;
            public bool IncludeComments { get; set; } = true;
        }
}
