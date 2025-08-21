namespace PerformanceEvaluation.Application.DTOs.Search
{
    public class CriteriaSearchDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string BaseDescription { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public List<string> ApplicableRoles { get; set; } = new();
        public DateTime CreatedDate { get; set; }
    }
}