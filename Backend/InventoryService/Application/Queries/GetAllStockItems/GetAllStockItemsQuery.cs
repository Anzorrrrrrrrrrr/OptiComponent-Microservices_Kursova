using InventoryService.Domain.Entities;
using MediatR;

namespace InventoryService.Application.Queries.GetAllStockItems;

public record GetAllStockItemsQuery() : IRequest<IEnumerable<StockItem>>;
