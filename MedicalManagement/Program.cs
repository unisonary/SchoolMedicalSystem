﻿using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Text;
using MedicalManagement.Data;
using MedicalManagement.Helpers;
using MedicalManagement.Services;
using MedicalManagement.Services.Interfaces;
using Microsoft.OpenApi.Models;
using MedicalManagement.Repositories;
using MedicalManagement.Middlewares;
using Hangfire;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Http.Features;


var builder = WebApplication.CreateBuilder(args);

// CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174") // FE port của bạn
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add services to the container.

// Configure database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register services and helpers
builder.Services.AddScoped<IJwtHelper, JwtHelper>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Read JWT settings from config
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"];
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];
var emailJwtSecret = builder.Configuration["JwtSettings:EmailConsentSecret"];

builder.Services.AddSingleton(new EmailJwtHelper(emailJwtSecret));

// Configure authentication with JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});



builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MedicalManagement API", Version = "v1" });

    // Thêm hỗ trợ JWT Bearer Token
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

builder.Services.AddScoped<IMedicationRepository, MedicationRepository>();

builder.Services.AddScoped<IMedicationService, MedicationService>();

builder.Services.AddScoped<IConsentService, ConsentService>();

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IMedicalEventService, MedicalEventService>();

builder.Services.AddScoped<IInventoryService, InventoryService>();

builder.Services.AddScoped<ISupplyLogService, SupplyLogService>();

builder.Services.AddScoped<INotificationService, NotificationService>();

builder.Services.AddScoped<IVaccinationService, VaccinationService>();

builder.Services.AddScoped<IHealthCheckupService, HealthCheckupService>();

builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IMedicalPlanService, MedicalPlanService>();
builder.Services.AddScoped<IAssignmentService, AssignmentService>();
builder.Services.AddScoped<IAdminService, AdminService>();

builder.Services.AddScoped<IInventoryAlertService, InventoryAlertService>();
builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<IPublicContentService, PublicContentService>();


builder.Services.AddHangfire(config =>
    config.UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHangfireServer();

builder.Services.AddScoped<IReportService, ReportService>();

builder.Services.AddScoped<IParentStudentService, ParentStudentService>();


builder.Services.Configure<FormOptions>(options =>
{
    options.BufferBody = true; // đảm bảo ASP.NET đọc vào MemoryStream
    options.MultipartBodyLengthLimit = 50 * 1024 * 1024; // tăng giới hạn nếu cần
});


builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("SmtpSettings")
);
builder.Services.AddTransient<EmailService>();

var app = builder.Build();

app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

//app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseHangfireDashboard();
app.UseHangfireServer();

// Test chạy ngay khi app khởi động
//BackgroundJob.Enqueue<IInventoryAlertService>(service => service.GenerateDailyInventoryAlertsAsync());


RecurringJob.AddOrUpdate<IInventoryAlertService>(
    "daily-inventory-alert",
    service => service.GenerateDailyInventoryAlertsAsync(),
    Cron.Daily(7, 0));

app.MapControllers();

app.Run();


