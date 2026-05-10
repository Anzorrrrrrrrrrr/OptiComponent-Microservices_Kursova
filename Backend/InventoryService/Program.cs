using MediatR;
using System.Reflection;
using System.Text;                                // 🔹 NEW
using InventoryService.Infrastructure.Persistence;
using InventoryService.Application.Interfaces;
using InventoryService.Infrastructure.Repositories;
using FluentValidation;
using InventoryService.Application.Validators;
using InventoryService.Health;
using InventoryService.Messaging;
using Serilog;
using Microsoft.AspNetCore.Authentication.JwtBearer;  // 🔹 NEW
using Microsoft.IdentityModel.Tokens;                 // 🔹 NEW
using Microsoft.OpenApi.Models;
using InventoryService.Application.Behaviors;

var builder = WebApplication.CreateBuilder(args);

// =============== SERILOG ===============
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/inventory-service-.log",
        rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();
// ======================================

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "InventoryService", Version = "v1" });

    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        Scheme = "bearer",
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Description = "Put ONLY your JWT token here (without 'Bearer ')",

        Reference = new OpenApiReference
        {
            Id = "Bearer",
            Type = ReferenceType.SecurityScheme
        }
    };

    c.AddSecurityDefinition("Bearer", jwtSecurityScheme);

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            jwtSecurityScheme,
            Array.Empty<string>()
        }
    });
});

// цей об’єкт можна взагалі видалити, бо не використовується
var securityScheme = new OpenApiSecurityScheme
{
    Name = "Authorization",
    Description = "Enter 'Bearer {token}'",
    In = ParameterLocation.Header,
    Type = SecuritySchemeType.Http,
    Scheme = "bearer",
    BearerFormat = "JWT"
};

builder.Services.AddValidatorsFromAssemblyContaining<StockItemValidator>();

builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<IStockItemRepository, StockItemRepository>();

builder.Services.AddHostedService<RabbitMqOrderCreatedConsumer>();

// MediatR + реєстрація хендлерів
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

// 🔹 Ось ГОЛОВНИЙ рядок – підключаємо ValidationBehavior як pipeline
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

// HealthCheck для Mongo
builder.Services.AddHealthChecks()
    .AddCheck<MongoHealthCheck>("MongoDb");

// ===== JWT Auth =====
var jwtSection = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

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
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();

app.UseGlobalExceptionMiddleware();

app.UseHttpsRedirection();

app.UseAuthentication();   // 🔹 NEW
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
