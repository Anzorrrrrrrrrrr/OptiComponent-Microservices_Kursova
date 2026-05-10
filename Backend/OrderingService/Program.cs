using OrderingService.DAL;
using OrderingService.BLL;
using OrderingService.External;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Text;                                // 🔹 NEW
using Microsoft.AspNetCore.Authentication.JwtBearer;  // 🔹 NEW
using Microsoft.IdentityModel.Tokens;                 // 🔹 NEW
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// =============== SERILOG ===============
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/ordering-service-.log",
        rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();
// ======================================

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "OrderingService", Version = "v1" });

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


// EF для міграцій / HealthChecks
var orderingConn = builder.Configuration.GetConnectionString("OrderingDb");
builder.Services.AddDbContext<OrderContext>(options =>
    options.UseSqlServer(orderingConn));

// Dapper репозиторій + сервіс
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<IEventPublisher, RabbitMqEventPublisher>();

// HTTP клієнт до CatalogService
builder.Services.AddHttpClient<ICatalogClient, CatalogClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ServiceUrls:Catalog"]!);
});

// gRPC-клієнт
builder.Services.AddScoped<GrpcCatalogClient>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        p => p.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

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

// HealthChecks
builder.Services.AddHealthChecks()
    .AddSqlServer(orderingConn, name: "OrderingDb");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();

app.UseGlobalExceptionMiddleware();

app.UseCors("AllowAll");
app.UseHttpsRedirection();

app.UseAuthentication();   // 🔹 NEW
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
