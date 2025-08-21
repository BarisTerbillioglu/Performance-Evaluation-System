using System.Net;
using System.Text.Json;
using PerformanceEvaluation.Core.Exceptions;
using System.ComponentModel.DataAnnotations;


namespace PerformanceEvaluation.API.Middleware
{
    /// <summary>
    /// 
    /// </summary>
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="next"></param>
        /// <param name="logger"></param>
        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
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
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred. Request: {Method} {Path}",
                    context.Request.Method, context.Request.Path);

                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            object response = new
            {
                Message = "An error occurred while processing your request.",
                RequestId = context.Request.Headers["X-Request-ID"].FirstOrDefault(),
                Timestamp = DateTime.UtcNow
            };

            switch (exception)
            {
                case ValidationException validationEx:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response = new
                    {
                        Message = "Validation failed",
                        Errors = validationEx.Message,
                        RequestId = context.Request.Headers["X-Request-ID"].FirstOrDefault(),
                        Timestamp = DateTime.UtcNow
                    };
                    break;

                case UnauthorizedAccessException:
                    context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                    response = new
                    {
                        Message = "Access denied",
                        RequestId = context.Request.Headers["X-Request-ID"].FirstOrDefault(),
                        Timestamp = DateTime.UtcNow
                    };
                    break;

                case ArgumentNotFoundException:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    response = new
                    {
                        Message = exception.Message,
                        RequestId = context.Request.Headers["X-Request-ID"].FirstOrDefault(),
                        Timestamp = DateTime.UtcNow
                    };
                    break;

                case InvalidOperationException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response = new
                    {
                        Message = exception.Message,
                        RequestId = context.Request.Headers["X-Request-ID"].FirstOrDefault(),
                        Timestamp = DateTime.UtcNow
                    };
                    break;

                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    break;
            }

            var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(jsonResponse);
        }
    }
}
