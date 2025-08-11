namespace PerformanceEvaluation.Application.DTOs.Auth
{

    public class LoginResponse
    {
        public bool success { get; set; }
        public required string message { get; set; }
        public required UserInfo User { get; set; }
        
    }

}