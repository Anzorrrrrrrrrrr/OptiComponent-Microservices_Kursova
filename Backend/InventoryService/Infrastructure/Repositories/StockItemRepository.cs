using InventoryService.Application.Interfaces;
using InventoryService.Domain.Entities;
using InventoryService.Infrastructure.Persistence;
using MongoDB.Driver;

namespace InventoryService.Infrastructure.Repositories;

public class StockItemRepository : IStockItemRepository
{
    private readonly IMongoCollection<StockItem> _collection;

    public StockItemRepository(MongoDbContext context)
    {
        _collection = context.StockItems;
    }

    public async Task<IEnumerable<StockItem>> GetAllAsync() =>
        await _collection.Find(_ => true).ToListAsync();

    public async Task<StockItem?> GetByIdAsync(string id) =>
        await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task AddAsync(StockItem item) =>
        await _collection.InsertOneAsync(item);

    public async Task UpdateAsync(StockItem item) =>
        await _collection.ReplaceOneAsync(x => x.Id == item.Id, item);

    public async Task DeleteAsync(string id) =>
        await _collection.DeleteOneAsync(x => x.Id == id);

    
    public async Task<IEnumerable<StockItem>> FilterAsync(string? componentName, int? minQty, int? maxQty, string sortBy, string order, int pageNumber, int pageSize)
    {
        var filter = Builders<StockItem>.Filter.Empty;

        if (!string.IsNullOrEmpty(componentName))
            filter &= Builders<StockItem>.Filter.Regex(x => x.ComponentName, new MongoDB.Bson.BsonRegularExpression(componentName, "i"));

        if (minQty.HasValue)
            filter &= Builders<StockItem>.Filter.Gte(x => x.TotalQuantity, minQty.Value);

        if (maxQty.HasValue)
            filter &= Builders<StockItem>.Filter.Lte(x => x.TotalQuantity, maxQty.Value);

        var sort = order.ToLower() == "desc"
            ? Builders<StockItem>.Sort.Descending(sortBy)
            : Builders<StockItem>.Sort.Ascending(sortBy);

        return await _collection.Find(filter)
            .Sort(sort)
            .Skip((pageNumber - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();
    }
}
