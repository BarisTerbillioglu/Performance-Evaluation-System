namespace PerformanceEvaluation.Application.DTOs.BulkOperations
{
    public class ImportRowResult
    {
        public int RowNumber { get; set; }
        public bool Success { get; set; }
        public string? Error { get; set; }
        public object? Data { get; set; }
        public string? EntityId { get; set; }
    }
}