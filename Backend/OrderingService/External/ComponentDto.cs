namespace OrderingService.External;

public class ComponentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
}
