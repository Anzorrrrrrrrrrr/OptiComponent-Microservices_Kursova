namespace CatalogService.BLL.DTOs;

public class ComponentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }

    
    public int CategoryId { get; set; }
    public int SupplierId { get; set; }

    
    public string? CategoryName { get; set; }
    public string? SupplierName { get; set; }

    public int Quantity { get; set; }
}