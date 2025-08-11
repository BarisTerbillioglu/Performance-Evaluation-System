namespace PerformanceEvaluation.Core.Enums
{
    public enum AuthFailureReason
    {
        // Invalid email or password provided
        InvalidCredentials = 1,

        // User account has been locked due to security policy
        AccountLocked = 2,

        // User account is inactive or disabled
        AccountInactive = 3,

        // Too many failed login attempts in a short period
        TooManyAttempts = 4,

        // System error occurred during authentication
        SystemError = 5
    }
}