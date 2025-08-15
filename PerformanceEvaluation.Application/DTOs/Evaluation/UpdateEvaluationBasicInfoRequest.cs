namespace PerformanceEvaluation.Application.DTOs.Evaluation
{
    public class UpdateEvaluationBasicInfoRequest
    {
        public string? Period { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? GeneralComments { get; set; }
    }
}