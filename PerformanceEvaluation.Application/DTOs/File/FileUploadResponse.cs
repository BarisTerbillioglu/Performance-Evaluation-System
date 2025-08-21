namespace PerformanceEvaluation.Application.DTOs.File
{
    public class FileUploadResponse
    {
        public string Message { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string? DocumentType { get; set; }
        public DateTime UploadedAt { get; set; }
        public long FileSize { get; set; }
        public string ContentType { get; set; } = string.Empty;
    }
}