using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PerformanceEvaluation.Infrastructure.Data;
using System.Text;

using PerformanceEvaluation.Core.Interfaces;
using PerformanceEvaluation.Application.Services.Interfaces;
using PerformanceEvaluation.Application.Services.Implementations;
using PerformanceEvaluation.Infrastructure.Services.Interfaces;
using PerformanceEvaluation.Infrastructure.Services.Implementations;
using PerformanceEvaluation.Infrastructure.Repositories.Interfaces;
using PerformanceEvaluation.Infrastructure.Repositories.Implementation;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Database Configuration - Azure SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,  // Reduced from 5
            maxRetryDelay: TimeSpan.FromSeconds(10), // Reduced from 30
            errorNumbersToAdd: null);
        sqlOptions.CommandTimeout(120); // Increased from 30
    });
    options.EnableSensitiveDataLogging(); // Add this for debugging
    options.LogTo(Console.WriteLine, LogLevel.Information); // Add this for EF logging
});

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]?? throw new InvalidOperationException("JWT SecretKey is not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {

                var token = context.Request.Cookies["accessToken"];
                
                if (string.IsNullOrEmpty(token))
                {
                    var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                    if (authHeader?.StartsWith("Bearer ") == true)
                    {
                        token = authHeader.Substring("Bearer ".Length).Trim();
                    }
                }
                
                context.Token = token;
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.Headers.Append("Token-Expired", "true");
                }
                return Task.CompletedTask;
            }
        };
    });

// Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("EvaluatorOrAdmin", policy => policy.RequireRole("Admin", "Evaluator"));
    options.AddPolicy("AllUsers", policy => policy.RequireRole("Admin", "Evaluator", "Employee"));
});

// AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Performance Evaluation API",
        Version = "v1",
        Description = "IT Department Performance Evaluation System API"
    });

    // JWT Bearer configuration for Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityDefinition("Cookie", new OpenApiSecurityScheme
    {
        Description = "Cookie authentication using accessToken cookie",
        Name = "accessToken",
        In = ParameterLocation.Cookie,
        Type = SecuritySchemeType.ApiKey
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
        },
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Cookie"
                }
            },
            new string[] { }
        }
    });
});

// Domain Services (Core Layer)
builder.Services.AddScoped<IAuthService, AuthService>();

// Infrastructure Services
builder.Services.AddScoped<ITokenService, TokenService>();
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

// Register application services
// TODO: Add your service registrations here

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Performance Evaluation API V1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("Starting database migration check...");

    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    logger.LogInformation("Got database context...");

    try
    {
        logger.LogInformation("Attempting to migrate database...");
        context.Database.Migrate();
        logger.LogInformation("Database migration completed successfully!");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error applying database migrations");
    }
}


app.Run();
