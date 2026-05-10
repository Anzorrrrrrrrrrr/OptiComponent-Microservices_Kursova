namespace InventoryService.Application.DTOs;

public class StockItemFilterDto
{
    public string? ComponentName { get; set; }
    public int? MinQuantity { get; set; }
    public int? MaxQuantity { get; set; }
    public string? SortBy { get; set; } = "ComponentName";
    public string? Order { get; set; } = "asc";
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
