namespace PerformanceEvaluation.Application.DTOs.BulkOperations
{
    public class BulkImportResultDto
    {
        public bool Success { get; set; }
        public int TotalRows { get; set; }
        public int SuccessfulRows { get; set; }
        public int FailedRows { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<ImportRowResult> RowResults { get; set; } = new();
        public string? Message { get; set; }
        public string? FileName { get; set; }
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    }
}