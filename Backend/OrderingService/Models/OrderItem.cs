namespace OrderingService.Models;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string ComponentName { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
