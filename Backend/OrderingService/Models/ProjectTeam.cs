namespace OrderingService.Models;

public class ProjectTeam
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Leader { get; set; }
}
