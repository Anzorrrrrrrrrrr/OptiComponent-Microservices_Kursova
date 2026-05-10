namespace CatalogService.BLL.DTOs;

public class OrderCreateDto
{
    public string CustomerName { get; set; } = string.Empty;
    // Список деталей, які клієнт додає у замовлення
    public List<OrderItemCreateDto> Items { get; set; } = new();
}

public class OrderItemCreateDto
{
    public int ComponentId { get; set; }
    public int Quantity { get; set; } // Скільки штук хоче купити
}