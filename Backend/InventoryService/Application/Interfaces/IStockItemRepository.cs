using InventoryService.Domain.Entities;

namespace InventoryService.Application.Interfaces;

public interface IStockItemRepository
{
    Task<IEnumerable<StockItem>> GetAllAsync();
    Task<StockItem?> GetByIdAsync(string id);
    Task AddAsync(StockItem item);
    Task UpdateAsync(StockItem item);
    Task DeleteAsync(string id);

    Task<IEnumerable<StockItem>> FilterAsync(string? componentName, int? minQty, int? maxQty, string sortBy, string order, int pageNumber, int pageSize);
}
