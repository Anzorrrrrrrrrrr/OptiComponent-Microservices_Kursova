using InventoryService.Infrastructure.Persistence;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace InventoryService.Health;

public class MongoHealthCheck : IHealthCheck
{
    private readonly MongoDbContext _context;

    public MongoHealthCheck(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Легка операція, щоб перевірити підключення
            await _context.StockItems.EstimatedDocumentCountAsync(cancellationToken: cancellationToken);
            return HealthCheckResult.Healthy("MongoDB is OK");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("MongoDB check failed", ex);
        }
    }
}
