namespace InventoryService.Domain.ValueObjects;

public class StockHistory
{
    public DateTime Date { get; set; }
    public string Action { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
