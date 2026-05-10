namespace CatalogService.DAL.Entities;

public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int ComponentId { get; set; }
    public Component Component { get; set; } = null!;

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}