using System.ComponentModel.DataAnnotations;

namespace CatalogService.DAL.Entities;

public class Order
{
    public int Id { get; set; }

    [Required]
    public string OrderNumber { get; set; } = string.Empty;

    [Required]
    public string CustomerName { get; set; } = string.Empty;

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public decimal TotalPrice { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.New;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public enum OrderStatus
{
    New,
    Processing,
    Shipped,
    Completed,
    Cancelled
}