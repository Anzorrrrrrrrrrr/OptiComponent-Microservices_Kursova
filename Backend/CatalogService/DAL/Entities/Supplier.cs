using System.ComponentModel;

namespace CatalogService.DAL.Entities;

public class Supplier
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public ICollection<Component> Components { get; set; } = new List<Component>();
}
