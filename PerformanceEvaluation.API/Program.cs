using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PerformanceEvaluation.Infrastructure.Data;
using System.Text;
using System.Threading.RateLimiting;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.RateLimiting;
using Serilog;

using PerformanceEvaluation.Core.Interfaces;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Application.Services.Implementations;
using PerformanceEvaluation.Infrastructure.Services.Interfaces;
using PerformanceEvaluation.Infrastructure.Services.Implementations;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;
using PerformanceEvaluation.Infrastructure.Repositories.Implementation;
using PerformanceEvaluation.Infrastructure.Configuration;

// Background Services
using PerformanceEvaluation.API.BackgroundServices;

// Health Checks
using PerformanceEvaluation.API.HealthChecks;

// Middleware
using PerformanceEvaluation.API.Middleware;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File(
        path: builder.Configuration["Logging:File:Path"] ?? "./logs/app-.txt",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: int.Parse(builder.Configuration["Logging:File:RetainedFileCountLimit"] ?? "30"))
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// Configure HTTP JSON options
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

// Database Configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null);
        sqlOptions.CommandTimeout(120);
    });
    
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.LogTo(Console.WriteLine, LogLevel.Information);
    }
});

// Email Configuration with validation
builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection("Email"));
builder.Services.AddOptions<EmailOptions>()
    .Bind(builder.Configuration.GetSection("Email"))
    .ValidateDataAnnotations();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured");
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (string.IsNullOrEmpty(token))
            {
                token = context.Request.Cookies["accessToken"];
            }
            if (!string.IsNullOrEmpty(token))
            {
                context.Token = token;
            }
            return Task.CompletedTask;
        }
    };
});

// Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("ManagerOrAdmin", policy => policy.RequireRole("Manager", "Admin"));
    options.AddPolicy("EvaluatorOrAdmin", policy => policy.RequireRole("Evaluator", "Manager", "Admin"));
    options.AddPolicy("AllUsers", policy => policy.RequireRole("Employee", "Evaluator", "Manager", "Admin"));
});

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("GeneralLimiter", limiterOptions =>
    {
        limiterOptions.PermitLimit = builder.Configuration.GetValue<int>("RateLimiting:GeneralLimiter:PermitLimit", 100);
        limiterOptions.Window = TimeSpan.FromMinutes(builder.Configuration.GetValue<int>("RateLimiting:GeneralLimiter:WindowInMinutes", 1));
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 10;
    });

    options.AddFixedWindowLimiter("AuthLimiter", limiterOptions =>
    {
        limiterOptions.PermitLimit = builder.Configuration.GetValue<int>("RateLimiting:AuthLimiter:PermitLimit", 10);
        limiterOptions.Window = TimeSpan.FromMinutes(builder.Configuration.GetValue<int>("RateLimiting:AuthLimiter:WindowInMinutes", 1));
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 2;
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// CORS Configuration
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:3000" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowedOrigins", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database")
    .AddDbContextCheck<ApplicationDbContext>("ef_context");

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Performance Evaluation API",
        Version = "v1",
        Description = "API for Performance Evaluation System"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
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
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] { }
        }
    });
});

// Domain Services (Core Layer)
builder.Services.AddScoped<IAuthService, AuthService>();

// Infrastructure Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<ICriteriaRepository, CriteriaRepository>();
builder.Services.AddScoped<ICriteriaCategoryRepository, CriteriaCategoryRepository>();
builder.Services.AddScoped<IEvaluationRepository, EvaluationRepository>();
builder.Services.AddScoped<IEvaluationScoreRepository, EvaluationScoreRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddScoped<ITeamRepository, TeamRepository>();
builder.Services.AddScoped<IEvaluatorAssignmentRepository, EvaluatorAssignmentRepository>();

// Application Services
builder.Services.AddScoped<IAuthApplicationService, AuthApplicationService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<ICriteriaService, CriteriaService>();
builder.Services.AddScoped<ICriteriaCategoryService, CriteriaCategoryService>();
builder.Services.AddScoped<IEvaluationService, EvaluationService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<IFileService, FileService>();


// Background Services - Moved to API project to avoid circular dependency
builder.Services.AddHostedService<NotificationBackgroundService>();
builder.Services.AddHostedService<CleanupBackgroundService>();

builder.Services.AddMemoryCache();

builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 52428800; 
});

builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 52428800; 
});

builder.Services.Configure<FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = 52428800; 
    options.MultipartHeadersLengthLimit = int.MaxValue;
});


var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Performance Evaluation API V1");
        c.RoutePrefix = string.Empty;
    });
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// Custom middleware pipeline
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<RequestValidationMiddleware>();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowedOrigins");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Health checks endpoint
app.MapHealthChecks("/health");
app.MapControllers().RequireRateLimiting("GeneralLimiter");

// Ensure database is created and migrated
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await context.Database.MigrateAsync();
    
    // Seed data if needed
    await SeedDataAsync(context);
}

Log.Information("Performance Evaluation API starting up...");
Log.Information("Environment: {Environment}", app.Environment.EnvironmentName);

app.Run();

// Seed data method
static async Task SeedDataAsync(ApplicationDbContext context)
{
    try
    {
        if (!await context.Users.AnyAsync())
        {
            Log.Information("Seeding initial data...");
            
            // Add default departments
            var departments = new[]
            {
                new PerformanceEvaluation.Core.Entities.Department { Name = "IT", Description = "Information Technology", IsActive = true, CreatedDate = DateTime.UtcNow },
                new PerformanceEvaluation.Core.Entities.Department { Name = "HR", Description = "Human Resources", IsActive = true, CreatedDate = DateTime.UtcNow },
                new PerformanceEvaluation.Core.Entities.Department { Name = "Finance", Description = "Finance Department", IsActive = true, CreatedDate = DateTime.UtcNow }
            };
            
            await context.Departments.AddRangeAsync(departments);
            await context.SaveChangesAsync();

            // Add default roles
            var roles = new[]
            {
                new PerformanceEvaluation.Core.Entities.Role { Name = "Admin", Description = "System Administrator", IsActive = true },
                new PerformanceEvaluation.Core.Entities.Role { Name = "Manager", Description = "Department Manager", IsActive = true },
                new PerformanceEvaluation.Core.Entities.Role { Name = "Employee", Description = "Regular Employee", IsActive = true }
            };
            
            await context.Roles.AddRangeAsync(roles);
            await context.SaveChangesAsync();

            // Create default admin user
            var adminUser = new PerformanceEvaluation.Core.Entities.User
            {
                FirstName = "System",
                LastName = "Administrator",
                Email = "admin@company.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                DepartmentID = 1, // IT Department
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };
            
            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();

            // Assign admin role to default user
            var adminRoleAssignment = new PerformanceEvaluation.Core.Entities.RoleAssignment
            {
                UserID = adminUser.ID,
                RoleID = 1, // Admin role
                AssignedDate = DateTime.UtcNow
            };
            
            await context.RoleAssignments.AddAsync(adminRoleAssignment);
            await context.SaveChangesAsync();

            Log.Information("Initial data seeded successfully");
        }
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error seeding initial data");
    }
}