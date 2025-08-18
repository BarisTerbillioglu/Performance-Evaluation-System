namespace PerformanceEvaluation.Application.DTOs.User
{
    public class EmployeeListDto
    {
        public int ID { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public List<int> TeamId { get; set; } = new List<int>();
        public int DepartmentId { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}