namespace PerformanceEvaluation.Application.DTOs.User
{
    public class CreateUserRequest
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }

        public required string Email { get; set; }

        public required string PasswordHash { get; set; }
        public int DepartmentId { get; set; }


    }
}