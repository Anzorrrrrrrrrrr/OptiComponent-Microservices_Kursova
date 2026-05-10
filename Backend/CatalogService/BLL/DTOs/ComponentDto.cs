namespace CatalogService.BLL.DTOs;

public class ComponentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }

    // 1. ОБОВ'ЯЗКОВО додаємо ці поля, щоб C# міг приймати ID з React
    public int CategoryId { get; set; }
    public int SupplierId { get; set; }

    // 2. Робимо назви НЕОБОВ'ЯЗКОВИМИ (додаємо ? і прибираємо = string.Empty)
    public string? CategoryName { get; set; }
    public string? SupplierName { get; set; }

    public int Quantity { get; set; }
}