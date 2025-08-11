using PerformanceEvaluation.Core.Entities;
using PerformanceEvaluation.Core.Enums;

namespace PerformanceEvaluation.Core.Models
{
    /// <summary>
    /// Domain model representing the result of an authentication attempt
    /// Pure domain model without infrastructure dependencies
    /// </summary>
    public class AuthResult
    {
        public bool IsSuccess { get; set; }

        public string Message { get; set; } = string.Empty;

        public User? User { get; set; }

        public AuthFailureReason? FailureReason { get; set; }

        public DateTime AttemtepAt { get; set; } = DateTime.UtcNow;

        public static AuthResult Success(User user, string message = "Authentication successful")
        {
            return new AuthResult
            {
                IsSuccess = true,
                Message = message,
                User = user,
                FailureReason = null
            };
        }

        public static AuthResult Failure(string message, AuthFailureReason reason)
        {
            return new AuthResult
            {
                IsSuccess = false,
                Message = message,
                User = null,
                FailureReason = reason
            };
        }

    }
}