namespace PerformanceEvaluation.Application.DTOs.File
{
    public class FileValidationResponse
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string ContentType { get; set; } = string.Empty;
    }
}