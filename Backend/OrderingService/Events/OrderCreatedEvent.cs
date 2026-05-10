namespace OrderingService.Events;

public class OrderCreatedEvent
{
    public int OrderId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public string ComponentName { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
