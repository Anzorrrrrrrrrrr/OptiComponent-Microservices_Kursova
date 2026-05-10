namespace InventoryService.Domain.ValueObjects;

public class Location
{
    public string Bin { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
