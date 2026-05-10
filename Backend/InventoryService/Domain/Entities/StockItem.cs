namespace InventoryService.Domain.Entities;
using InventoryService.Domain.ValueObjects;

public class StockItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public int ComponentId { get; set; }
    public string ComponentName { get; set; } = string.Empty;
    public int TotalQuantity { get; set; }
    public List<Location> Locations { get; set; } = new();
    public List<StockHistory> StockHistory { get; set; } = new();
}
