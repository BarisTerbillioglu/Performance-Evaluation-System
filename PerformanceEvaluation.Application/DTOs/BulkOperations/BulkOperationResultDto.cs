namespace PerformanceEvaluation.Application.DTOs.BulkOperations
{
    public class BulkOperationResultDto
    {
        public bool Success { get; set; }
        public int TotalItems { get; set; }
        public int SuccessfulItems { get; set; }
        public int FailedItems { get; set; }
        public List<string> Errors { get; set; } = new();
        public string? Message { get; set; }
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    }
}