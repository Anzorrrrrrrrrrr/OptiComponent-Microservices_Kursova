using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");

            context.Response.ContentType = "application/problem+json";

            int statusCode;
            string title;
            string? detail = ex.Message;
            object? errors = null;

            if (ex is FluentValidation.ValidationException vex)
            {
                statusCode = StatusCodes.Status400BadRequest;
                title = "Validation error";
                errors = vex.Errors.Select(e => new { e.PropertyName, e.ErrorMessage });
            }
            else
            {
                statusCode = StatusCodes.Status500InternalServerError;
                title = "Internal Server Error";
            }

            context.Response.StatusCode = statusCode;

            var problem = new
            {
                type = $"https://httpstatuses.com/{statusCode}",
                title,
                status = statusCode,
                detail,
                errors,
                traceId = context.TraceIdentifier
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
        }

    }
}
