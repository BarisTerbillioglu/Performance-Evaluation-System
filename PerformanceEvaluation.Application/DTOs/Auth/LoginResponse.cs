namespace PerformanceEvaluation.Application.DTOs.Auth
{

    public class LoginResponse
    {
        public bool success { get; set; }
        public required string message { get; set; }
        public required UserInfo User { get; set; }
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

}