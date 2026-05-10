namespace CatalogService.DAL.Entities;

public class Datasheet
{
    public int Id { get; set; }
    public int ComponentId { get; set; }
    public string Url { get; set; } = string.Empty;
    public Component? Component { get; set; }
}
