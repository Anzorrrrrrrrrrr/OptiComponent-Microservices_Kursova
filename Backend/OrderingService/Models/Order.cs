namespace OrderingService.Models;

public class Order
{
    public int Id { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = "Pending";
    public int ProjectTeamId { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}
