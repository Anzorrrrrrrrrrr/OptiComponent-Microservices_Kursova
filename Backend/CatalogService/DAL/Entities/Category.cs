using System.ComponentModel;

namespace CatalogService.DAL.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<Component> Components { get; set; } = new List<Component>();
}
