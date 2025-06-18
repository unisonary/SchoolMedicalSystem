using Microsoft.AspNetCore.Http;
using System.Net;
using System.Text.Json;
using MedicalManagement.Exceptions;

namespace MedicalManagement.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionHandlingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                context.Response.ContentType = "application/json";

                // Mặc định là lỗi hệ thống
                var statusCode = (int)HttpStatusCode.InternalServerError;
                var errorMessage = "Đã xảy ra lỗi hệ thống.";

                // Nếu là lỗi NotFoundException (hoặc các custom exception khác)
                if (ex is NotFoundException)
                {
                    statusCode = (int)HttpStatusCode.NotFound;
                    errorMessage = ex.Message;
                }
                else if (ex is UnauthorizedAccessException)
                {
                    statusCode = (int)HttpStatusCode.Unauthorized;
                    errorMessage = "Không có quyền truy cập.";
                }
                else if (ex is InvalidOperationException)
                {
                    statusCode = (int)HttpStatusCode.BadRequest;
                    errorMessage = ex.Message;
                }

                Console.WriteLine($"[Middleware] Bắt được lỗi: {ex.GetType().Name} - {ex.Message}");

                context.Response.StatusCode = statusCode;

                var result = JsonSerializer.Serialize(new { error = errorMessage });
                await context.Response.WriteAsync(result);
            }
        }
    }
}
