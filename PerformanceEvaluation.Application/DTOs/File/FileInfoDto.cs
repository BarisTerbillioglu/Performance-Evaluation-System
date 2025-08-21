namespace PerformanceEvaluation.Application.DTOs.File
{
    public class FileInfoDto
    {
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime LastModified { get; set; }
        public string Extension { get; set; } = string.Empty;
    }
}