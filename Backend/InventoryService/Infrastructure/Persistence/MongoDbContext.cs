using InventoryService.Domain.Entities;
using MongoDB.Driver;

namespace InventoryService.Infrastructure.Persistence;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration["MongoSettings:ConnectionString"];
        var databaseName = configuration["MongoSettings:DatabaseName"];

        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<StockItem> StockItems =>
        _database.GetCollection<StockItem>("StockItems");
}
