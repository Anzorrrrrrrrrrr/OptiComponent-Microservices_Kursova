using System.Data;

namespace CatalogService.DAL.Entities;

public class Component
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public int SupplierId { get; set; }

    public int Quantity { get; set; }

    public Category? Category { get; set; }
    public Supplier? Supplier { get; set; }
    public Datasheet? Datasheet { get; set; }
}
