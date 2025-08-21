namespace PerformanceEvaluation.API.Middleware
{
    /// <summary>
    /// Middleware for processing validation requests
    /// </summary>
    public class RequestValidationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestValidationMiddleware> _logger;

        /// <summary>
        /// Middleware for processing validation requests
        /// </summary>
        public RequestValidationMiddleware(RequestDelegate next, ILogger<RequestValidationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="context"></param>
        /// <returns></returns>
        public async Task InvokeAsync(HttpContext context)
        {
            // Log request details
            _logger.LogInformation("Processing request: {Method} {Path} from {IP}",
                context.Request.Method,
                context.Request.Path,
                context.Connection.RemoteIpAddress);

            // Add request ID for tracking
            if (!context.Request.Headers.ContainsKey("X-Request-ID"))
            {
                context.Request.Headers["X-Request-ID"] = Guid.NewGuid().ToString();
            }

            await _next(context);
        }
    }
}