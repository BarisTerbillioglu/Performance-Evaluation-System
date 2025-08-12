using PerformanceEvaluation.Core.Models;

namespace PerformanceEvaluation.Core.Interfaces
{
   
        /// <summary>
        /// Domain service interface for authentication business logic
        /// Contains pure business rules without infrastructure concerns
        /// </summary>
        public interface IAuthService
        {
            /// <summary>
            /// Validates user credentials and returns authentication result
            /// </summary>
            /// <param name="email">User email</param>
            /// <param name="password">Plain text password</param>
            /// <returns>Authentication result with user information</returns>
            Task<AuthResult> ValidateUserCredentialsAsync(string email, string password);

            /// <summary>
            /// Validates if user account is active and can authenticate
            /// </summary>
            /// <param name="userId">User ID</param>
            /// <returns>True if user can authenticate</returns>
            Task<bool> IsUserActiveAsync(int userId);

            /// <summary>
            /// Records successful login for audit purposes
            /// </summary>
            /// <param name="userId">User ID</param>
            /// <param name="loginTime">Login timestamp</param>
            Task RecordSuccessfulLoginAsync(int userId, DateTime loginTime);

            /// <summary>
            /// Records failed login attempt for security purposes
            /// </summary>
            /// <param name="email">Attempted email</param>
            /// <param name="attemptTime">Attempt timestamp</param>
            void RecordFailedLogin(string email, DateTime attemptTime);

            /// <summary>
            /// Checks if user account should be locked due to failed attempts
            /// </summary>
            /// <param name="email">User email</param>
            /// <returns>True if account should be locked</returns>
            Task<bool> ShouldLockAccountAsync(string email);
        }
    
}